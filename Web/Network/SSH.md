## 1. SSH(Secure Shell)

SSH（Secure Shell）は、暗号化と認証技術を用いてネットワーク経由で遠隔地のコンピュータ（サーバ）を安全に操作・管理するための通信プロトコル

## 2. ~/.ssh/config

[\~/.ssh/configについて #SSH - Qiita](https://qiita.com/passol78/items/2ad123e39efeb1a5286b)

.ssh/configは、ssh経由でのリモートサーバーの接続する際に利用される設定ファイル

一般的な書き方の問題点は、指定が増えるとコマンドが複雑になる

```bash
# 一般的な接続方法
ssh hoge.example.com

# ユーザー名を指定する場合は以下
ssh ユーザー名@hoge.example.com

# ポート名を指定する場合
ssh ユーザー名@ホスト名 -p ポート番号

# 公開鍵認証の場合
ssh ユーザー名@ホスト名 -i ~/.ssh/鍵の名前

# ポート名及び、公開鍵認証の場合
ssh ユーザー名@ホスト名 -i ~/.ssh/鍵の名前 -p ポート番号
```

.ssh/configでは以下のように書ける

```bash
Host 任意の接続名(hoge)
HostName ホスト名
User ユーザー名
Port ポート番号
IdentityFile 鍵へのPATH(例えば~/.ssh/hoge.key)
```

このように設定を書いておくと`ssh hoge`のように簡単に接続できる
