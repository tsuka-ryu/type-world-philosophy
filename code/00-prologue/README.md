# 00-prologue

- TypeScript 7.0.2（`npm run check`）
- GHC 9.6.7、言語拡張なし（`scripts/check-hs.sh`）

| ファイル | 期待する結果 |
| --- | --- |
| `ts/identity.ts` | 型検査を通る |
| `ts/not-identity.error.ts` | `TS2322: Type 'number' is not assignable to type 'T'.` |
| `hs/Identity.hs` | 型検査を通る |
