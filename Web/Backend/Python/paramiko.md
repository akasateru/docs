# 1. paramiko

Python で SSH/SFTP を扱うためのライブラリ。

## 1.1. SFTPClient のアップロード系メソッド

`SFTPClient` にはファイルをリモートへアップロードするメソッドが2種類ある。

### put(localpath, remotepath, ...)

ローカルの**ファイルパス（文字列）**を指定してアップロードする、最も一般的なメソッド。

```python
sftp.put('/local/path/file.txt', '/remote/path/file.txt')
```

### putfo(fl, remotepath, file_size=0, callback=None, confirm=True)

`put` + `fo`（file object）の略。ローカルパスではなく、**すでに開いているファイルオブジェクト**の中身をリモートへ書き込む。`BytesIO` などメモリ上のデータをファイルに書き出さずそのままアップロードしたいときに使う。

```python
import io
data = io.BytesIO(b"hello world")
sftp.putfo(data, '/remote/path/file.txt')
```

引数の意味:

- `file_size`: 進捗コールバック用にサイズを事前に渡せる（省略時は自動計算）
- `callback`: `(bytes_transferred, total_bytes)` を受け取る進捗表示用コールバック
- `confirm`: `True` の場合、転送後に `stat()` でサイズを検証する

### 関係性

`put()` の内部実装は、ローカルファイルを開いてファイルオブジェクトとして `putfo()` に渡すラッパーになっている。ダウンロード側にも対称的に `get()` / `getfo()` が存在する。