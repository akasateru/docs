# 1. Supabase

## 1.1. 概要

SupabaseはPostgreSQLをベースにしたオープンソースのBaaS（Backend as a Service）。「オープンソース版Firebase」と紹介されることが多く、DB・認証・ストレージ・エッジ関数などをまとめて提供する。

## 1.2. 主な機能

| 機能 | 内容 |
| ------------------- | ------------------------------------------------------ |
| Database | フルスペックのPostgreSQL。生SQLもGUIからも操作可能 |
| Auth | メール/パスワード、ソーシャルログイン、Magic Linkなど |
| Storage | ファイル・画像等のオブジェクトストレージ |
| Realtime | テーブルの変更をWebSocketで購読できる |
| Edge Functions | Deno製のサーバーレス関数 |

## 1.3. Row Level Security（RLS）

- PostgreSQLのRLS機能を使い、テーブル単位・行単位でアクセス制御を行うのがSupabaseのセキュリティの基本方針。
- クライアントから直接テーブルを叩くAPI構成でも、RLSポリシーを設定すれば「自分のデータしか見えない」制御が可能。
- ポリシーを設定し忘れると全ユーザーが全データにアクセスできてしまうため、テーブル作成時は必ずRLSを有効化してポリシーを定義する。

## 1.4. クライアントからの利用イメージ

```ts
const { data, error } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", userId);
```

自動生成されるREST API（PostgREST）やGraphQLエンドポイント経由でテーブルを直接操作できるため、バックエンドのAPI実装を省略できるケースが多い。

## 1.5. Firebaseとの主な違い

- データベースがNoSQL（Firestore）ではなくリレーショナル（PostgreSQL）である。
- セルフホストが可能で、ベンダーロックインを避けやすい。
- SQLに慣れている開発者にとっては学習コストが低い。

## 1.6. 参考

- [Supabase公式ドキュメント](https://supabase.com/docs)
