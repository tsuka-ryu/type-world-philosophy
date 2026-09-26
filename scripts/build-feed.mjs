// 本文に3行を書き足したコミットごとに1項目を作り、book/feed.xml に書き出す。
// ページ単位ではなくコミット単位なので、同じページへの追記も新着として届く。
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const SITE = "https://tsuka-ryu.github.io/type-world-philosophy/";
const LIMIT = 30;

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "pipe"] });

// 本文の行だけを取り出す。見出し、空行、引用（章冒頭のメタ情報）、HTMLコメント、コードブロックは除く。
function bodyLines(text) {
  const lines = [];
  let inComment = false;
  let inCode = false;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (inComment) {
      if (line.includes("-->")) inComment = false;
      continue;
    }
    if (line.startsWith("<!--")) {
      if (!line.includes("-->")) inComment = true;
      continue;
    }
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode || line === "" || line.startsWith("#") || line.startsWith(">")) continue;
    lines.push(line);
  }
  return lines;
}

function fileAt(rev, path) {
  try {
    return git("show", `${rev}:${path}`);
  } catch {
    return "";
  }
}

// a にあって b にない行（重複は数で比べる）
function minus(a, b) {
  const rest = new Map();
  for (const l of b) rest.set(l, (rest.get(l) ?? 0) + 1);
  return a.filter((l) => {
    const n = rest.get(l) ?? 0;
    if (n > 0) {
      rest.set(l, n - 1);
      return false;
    }
    return true;
  });
}

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const items = [];
const log = git("log", "--no-merges", "--format=%H%x09%aI%x09%s", "--", "src/*.md", ":!src/SUMMARY.md");
for (const entry of log.trim().split("\n").filter(Boolean)) {
  if (items.length >= LIMIT) break;
  const [sha, date, subject] = entry.split("\t");
  const files = git("diff-tree", "--no-commit-id", "--name-only", "-r", `${sha}^`, sha, "--", "src/*.md", ":!src/SUMMARY.md")
    .trim().split("\n").filter(Boolean);

  let added = [];
  let removed = [];
  let page;
  for (const path of files) {
    const before = bodyLines(fileAt(`${sha}^`, path));
    const after = bodyLines(fileAt(sha, path));
    const a = minus(after, before);
    if (a.length > 0 && !page) page = path;
    added = added.concat(a);
    removed = removed.concat(minus(before, after));
  }
  if (added.length === 0) continue;

  const pageName = page.replace(/^src\//, "").replace(/\.md$/, "");
  const link = SITE + (pageName === "README" ? "" : `${pageName}.html`);
  let html = added.map((l) => `<p>${escape(l)}</p>`).join("");
  if (removed.length > 0) {
    html += `<hr><p>修正前：</p>` + removed.map((l) => `<p><del>${escape(l)}</del></p>`).join("");
  }
  items.push(`    <item>
      <title>${escape(subject)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${sha}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <description>${escape(html)}</description>
    </item>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>型で哲学を読む（毎日の3行）</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>
    <description>型システムの用語と哲学の用語を一対ずつ接続するエッセイ。毎日書き足した3行を届ける。</description>
    <language>ja</language>
${items.join("\n")}
  </channel>
</rss>
`;

const out = process.argv[2] ?? "book/feed.xml";
writeFileSync(out, xml);
console.log(`${out}: ${items.length} 件`);
