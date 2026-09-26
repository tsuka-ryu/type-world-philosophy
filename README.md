# type-world-philosophy

『型で哲学を読む』。
型システムの用語と哲学の用語を一対ずつ接続し、型で書くことで哲学の問いに意外な帰結を引き出すエッセイ。

読む場所: https://tsuka-ryu.github.io/type-world-philosophy

## 執筆

仕様は `spec/BOOK_SPEC.md`、作業の手順は `CLAUDE.md`、進み具合は `BACKLOG.md` にある。

Claude のルーティンが毎日3行ずつ書き足す。
1章に1本のPRを立て、毎日の3行はそのPRにコミットとして積まれる。
章を書き上げるとPRが Ready for review になるので、レビューしてマージすると次の章に進む。

確認できなかった事実は `VERIFY.md` に積まれる。

## 検証

```bash
npm ci
npm run check              # TypeScript。*.error.ts は型エラーが出ることを確かめる
bash scripts/check-hs.sh   # Haskell。*.error.hs も同様
mdbook serve --open
```

## ライセンス

本文は CC BY 4.0。
文章規範 `spec/japanese-tech-writing/SKILL.md` は k16shikano 氏によるもので Unlicense。
