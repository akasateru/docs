# curl

コマンドラインから HTTP リクエストを送るツール。API の動作確認・疎通確認・デバッグの定番。

## 1. 基本

- **curl** = "Client URL"。URL を指定してデータを送受信する CLI ツール
- 引数なしのデフォルトは **GET リクエスト**で、レスポンスボディを標準出力に表示する

```bash
# 最小の使い方（GET してボディを表示）
curl https://example.com
```

---

## 2. よく使うオプション

短いオプションは基本的に**対応する長いオプション（`--verbose` など）の頭文字**。大文字は「小文字版の変種・強化形」という慣習がある（例: `-o`/`-O`, `-i`/`-I`, `-s`/`-S`）。

### 2.1. 出力・挙動の制御

| オプション | 由来 | 意味 | 用途 |
| --- | --- | --- | --- |
| `-v` | **v**erbose | リクエスト/レスポンスヘッダや TLS 交渉の詳細を表示 | 疎通・デバッグの第一手 |
| `-s` | **s**ilent | 進捗メーターやエラーを非表示 | スクリプトやパイプで使うとき |
| `-S` | **S**how error（`-s` の対） | silent 中でもエラーだけは表示 | `-sS` のセットで使う |
| `-o <file>` | **o**utput | レスポンスを指定ファイルに保存 | ファイルダウンロード |
| `-O` | `-o` の大文字版（`--remote-name`） | URL のファイル名のまま保存 | ダウンロード |
| `-L` | **L**ocation ヘッダに従う | リダイレクト（3xx）を自動で追跡 | 301/302 が返るサイト |
| `-i` | **i**nclude | レスポンスヘッダもボディと一緒に表示 | ステータスやヘッダの確認 |
| `-I` | `-i` の大文字版（`--head`） | HEAD リクエスト。ヘッダのみ取得 | ボディ不要な生存確認 |
| `-f` | **f**ail | HTTP エラー（4xx/5xx）時に終了コードで失敗させる | スクリプトでのエラー検知 |
| `-w <fmt>` | **w**rite-out | 指定フォーマットで結果を書き出す | ステータスコードのみ表示など |
| `-k` | 頭文字ではない（`--insecure`。i, s が使用済みで空き文字が割当。「s**K**ip verification」と覚える） | TLS 証明書の検証をスキップ | 検証用途のみ |

### 2.2. リクエストの組み立て

| オプション | 由来 | 意味 | 用途 |
| --- | --- | --- | --- |
| `-X <METHOD>` | 頭文字ではない（`--request`。「任意のメソッド X」のプレースホルダ。r は `--range` で使用済み） | HTTP メソッドを指定（POST, PUT, DELETE など） | API 操作 |
| `-H "Key: Value"` | **H**eader | リクエストヘッダを追加 | Content-Type や認証ヘッダ |
| `-d '<data>'` | **d**ata | リクエストボディを送信（暗黙に POST になる） | JSON やフォーム送信 |
| `-F 'key=@file'` | **F**orm（小文字 `-f` とは別単語） | multipart/form-data で送信 | ファイルアップロード |
| `-u user:pass` | **u**ser | Basic 認証 | 認証付きエンドポイント |

- **`-d` を付けると自動的に POST になる**ため、POST の場合 `-X POST` は省略可
- ヘッダは `-H` を複数回並べて追加できる

---

## 3. 実用例

### 3.1. API の動作確認（JSON を POST）

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "naoki", "role": "engineer"}'
```

### 3.2. ステータスコードだけ確認する

```bash
# -w で出力フォーマット指定、-o /dev/null でボディを捨てる
curl -s -o /dev/null -w "%{http_code}\n" https://example.com
```

### 3.3. レスポンス JSON を整形して読む

```bash
curl -s https://api.example.com/users | jq .
```

### 3.4. インストールスクリプトの実行（例: uv）

```bash
# -L: リダイレクト追跡 / -sS: silent だがエラーは表示 / -f: HTTPエラー時に失敗させる
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 4. デバッグの定石

- **まず `curl -v`**: TLS ハンドシェイク、送受信ヘッダ、ステータスコードまで一気に見える
- 名前解決から疑うときは `dig` / `nslookup`、ポート疎通は `ss`・`nc` と組み合わせる（→ [Network.md](Network.md) のコマンド集）
- `--connect-timeout 5 --max-time 10` でタイムアウトを明示すると、ハングか遅延かを切り分けやすい
- HTTPS の証明書エラーを一時的に無視するのは `-k`（**検証用途のみ**。恒常的に使わない）
