# 1. MIME (Multipurpose Internet Mail Extensions)

MIMEは、電子メールで様々な種類のデータ（非ASCII文字や添付ファイルなど）を扱えるようにするために策定された仕様。現在はメールに限らず、HTTPなどインターネット全般でデータの種類を示す仕組みとして使われている（[HTTP.md](HTTP.md)の`Content-Type`ヘッダ参照）。

## 1.1. 生まれた背景

初期のインターネットメール（SMTP）は7ビットASCIIテキストしか送れない制約があった。添付ファイル・画像・音声・多言語テキストなどを送る方法が必要になり、1990年代前半にMIMEが標準化された（RFC 2045〜2049が基本仕様）。

## 1.2. Content-Type ヘッダ

データの種類を「タイプ/サブタイプ」の形式で表す。

- `text/plain` — プレーンテキスト
- `text/html` — HTML文書
- `image/png`、`image/jpeg` — 画像
- `application/json` — JSONデータ
- `application/pdf` — PDFファイル
- `multipart/form-data` — フォーム送信（複数パートを含む）

## 1.3. Content-Transfer-Encoding

バイナリデータを7ビットASCII環境でも安全に送れるようにするエンコード方式を指定する。

- `base64` — バイナリをASCII文字列に変換
- `quoted-printable` — 非ASCII文字を`=XX`形式で表現
- `7bit` / `8bit` — エンコードなし

## 1.4. マルチパート構造

複数の異なる種類のデータ（本文＋添付ファイルなど）を1つのメッセージにまとめる仕組み。`boundary`という区切り文字列でパートを分ける。

```
Content-Type: multipart/mixed; boundary="BOUNDARY123"

--BOUNDARY123
Content-Type: text/plain

本文テキストです。
--BOUNDARY123
Content-Type: image/png
Content-Transfer-Encoding: base64

iVBORw0KGgoAAAANSUhEUgAA...
--BOUNDARY123--
```

## 1.5. 現在の使われ方

- **HTTP**: `Content-Type`ヘッダでレスポンス/リクエストのデータ形式を示す（例: `application/json`, `text/html; charset=utf-8`）
- **メール**: 添付ファイルや多言語件名（`=?UTF-8?B?...?=`のようなエンコード）
- **ファイルアップロード**: `multipart/form-data`でフォームからファイルを送信
- **API開発**: リクエスト/レスポンスのボディ形式を`Content-Type`で明示