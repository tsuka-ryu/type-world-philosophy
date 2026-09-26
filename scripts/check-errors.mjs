// *.error.ts は型エラーを出すことが期待されている。通ってしまったら失敗にする。
import { execFileSync } from "node:child_process";
import { globSync } from "node:fs";

const files = globSync("code/**/ts/*.error.ts");
let failed = false;
for (const file of files) {
  try {
    execFileSync("npx", ["tsc", "--ignoreConfig", "--noEmit", "--strict", "--target", "es2022", file], { stdio: "pipe" });
    console.error(`期待した型エラーが出なかった: ${file}`);
    failed = true;
  } catch (e) {
    console.log(`型エラーを確認: ${file}`);
    console.log(e.stdout.toString().trim());
  }
}
process.exit(failed ? 1 : 0);
