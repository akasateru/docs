
## 1. 概要

bashは「Unix系OSで標準的に使われるシェル（コマンドインタプリタ）」

- シェル: コマンドを受け取りOSに渡すプログラム。ログインシェルとして最も普及
- 拡張子は `.sh`。実行時は先頭に `#!/bin/bash` のシバンを書く

macOSのデフォルトシェルは [mac.md](mac.md) の通りzshに変更されているが、Linux/Docker環境では依然bashが標準的。

## 2. 変数

```bash
name="taro"          # 代入時は = の前後にスペースを入れない
echo "$name"          # 参照時は $変数名 または ${変数名}
readonly PI=3.14      # 読み取り専用変数
unset name             # 変数の削除

export PATH="$PATH:/usr/local/bin"  # 環境変数として子プロセスにも渡す
```

### 2.1. 特殊変数

| 変数 | 意味 |
| --- | --- |
| `$0` | スクリプト自身の名前 |
| `$1`〜`$9` | 位置引数（1番目〜9番目） |
| `$@` | 全引数（個別展開） |
| `$#` | 引数の数 |
| `$?` | 直前のコマンドの終了ステータス（0が正常） |
| `$$` | 実行中プロセスのPID |
| `$_` | 直前のコマンドの最後の引数 |

### 2.2. クォート

- `"..."`（ダブルクォート）: 変数展開・コマンド置換が行われる
- `'...'`（シングルクォート）: 文字列そのまま。展開されない
- `` `...` `` / `$(...)`: コマンド置換。`$(...)` の方がネスト可能で推奨

```bash
today=$(date +%Y-%m-%d)
echo "今日は${today}です"
```

## 3. 条件分岐

```bash
if [ "$1" = "start" ]; then
  echo "起動"
elif [ "$1" = "stop" ]; then
  echo "停止"
else
  echo "不明なコマンド"
fi
```

- `[ ]` は `test` コマンドの別表記。`[[ ]]` はbash拡張で、`&&`/`||`やパターンマッチが安全に使える
- 数値比較は `-eq` `-ne` `-lt` `-le` `-gt` `-ge`、文字列比較は `=` `!=` を使う（`==` は数値と混同しやすいので避ける）
- ファイル判定: `-f`（ファイル存在）、`-d`（ディレクトリ存在）、`-e`（存在）、`-x`（実行権限）

```bash
[[ -f "$file" ]] && echo "存在する"
```

## 4. ループ

```bash
# for
for i in 1 2 3; do
  echo "$i"
done

for file in *.txt; do
  echo "$file"
done

# while
count=0
while [ "$count" -lt 5 ]; do
  echo "$count"
  count=$((count + 1))
done

# 無限ループ + break/continue
while true; do
  read -r line || break
  [[ -z "$line" ]] && continue
  echo "$line"
done
```

## 5. 関数

```bash
greet() {
  local name="$1"   # local を付けないとグローバル変数になる
  echo "Hello, ${name}"
  return 0
}

greet "World"
```

## 6. 配列

```bash
arr=(apple banana cherry)
echo "${arr[0]}"       # apple
echo "${arr[@]}"       # 全要素
echo "${#arr[@]}"       # 要素数

arr+=(orange)           # 追加
```

## 7. リダイレクトとパイプ

| 記法 | 意味 |
| --- | --- |
| `>` | 標準出力を上書き |
| `>>` | 標準出力を追記 |
| `<` | 標準入力をファイルから |
| `2>` | 標準エラー出力をリダイレクト |
| `2>&1` | 標準エラーを標準出力へ統合 |
| `\|` | 前コマンドの標準出力を次コマンドの標準入力へ渡す |
| `&>` | 標準出力・標準エラーの両方をリダイレクト |

```bash
command > out.log 2>&1     # 出力とエラーをまとめてファイルへ
grep "ERROR" app.log | wc -l  # パイプで組み合わせ
```

## 8. よく使うコマンド

| コマンド | 説明 |
| --- | --- |
| `grep` | パターン検索。`-r`（再帰）、`-i`（大小無視）、`-n`（行番号） |
| `find` | ファイル検索。`find . -name "*.md"` |
| `xargs` | 標準入力を引数に変換してコマンド実行。`find . -name "*.log" \| xargs rm` |
| `sed` | ストリームエディタ。`sed 's/foo/bar/g' file` |
| `awk` | フィールド処理。`awk '{print $1}' file` |
| `cut` | 列の切り出し。`cut -d',' -f1 file.csv` |
| `sort` / `uniq` | 並び替え・重複除去 |
| `tr` | 文字の置換・削除。`tr 'a-z' 'A-Z'` |
| `curl` | HTTP通信 |
| `jq` | JSONの整形・抽出 |

## 9. 実行系オプション

```bash
set -e   # コマンドが失敗（非0終了）したら即座にスクリプトを終了
set -u   # 未定義変数を参照したらエラー
set -o pipefail  # パイプ内のいずれかが失敗したら全体を失敗扱いに
set -x   # 実行したコマンドをデバッグ出力
```

スクリプト冒頭に `set -euo pipefail` を書くのが定番（エラーを握り潰さない安全策）。

## 10. 引数解析（getopts）

```bash
while getopts "n:h" opt; do
  case $opt in
    n) name="$OPTARG" ;;
    h) echo "Usage: $0 -n <name>"; exit 0 ;;
    *) exit 1 ;;
  esac
done
```

## 11. 注意点・落とし穴

- 変数展開は基本 `"$var"` とダブルクォートで囲む（スペースを含む値で単語分割されるのを防ぐ）
- `[` と `]` の内側、`if`/`(` などの前後は必ずスペースを空ける
- ヒアドキュメントで複数行文字列を渡せる

```bash
cat <<EOF
複数行の
テキスト
EOF
```

## 12. 参考

- [Linux.md](../OS/Linux.md)
- [mac.md](mac.md)
