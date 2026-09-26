#!/usr/bin/env bash
# code/**/hs/*.hs を型検査する。*.error.hs は型エラーが出ることを期待する。
set -u
failed=0
while IFS= read -r f; do
  if [[ "$f" == *.error.hs ]]; then
    if ghc -fno-code "$f" >/dev/null 2>&1; then
      echo "期待した型エラーが出なかった: $f"; failed=1
    else
      echo "型エラーを確認: $f"; ghc -fno-code "$f" 2>&1 | sed -n '1,8p'
    fi
  else
    ghc -fno-code "$f" || failed=1
  fi
done < <(find code -path "*/hs/*.hs" | sort)
exit $failed
