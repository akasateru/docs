# dbmate

## 1. 概要

- データベースのスキーマ管理ツール

## 2. 使い方

- ```dbmate new create_users_table```

- 上のコマンドを叩くと`db/migrations/20260505120000_create_users_table.sql`のようなファイルができる
- 生成されたファイルには -- migrate:up（適用時）と -- migrate:down（元に戻す時）のセクションがある

```SQL
-- migrate:up
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- migrate:down
DROP TABLE users;
```

## 3. 基本コマンド

- `dbmate new`
- `dbmate up`
- `dbmate rollback`
- `dbmate status`
- `dbmate wait`
- `dbmate drop`

## 4. 接続設定

dbmateを動かすには、環境変数または .env ファイルに接続情報を書く。
`DATABASE_URL="postgres://user:pass@localhost:5432/dbname?sslmode=disable"`
