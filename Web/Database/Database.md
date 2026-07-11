
## 1. データベーススキーマ

- テーブルの定義
- 関係性の定義
- インデックスの定義
- ビューの定義

## 2. データベーススキーマの設計方法

- データベースの目的と要件を明確化する
- データモデリングを行う
- エンティティと属性を識別する
- 関係性を定義する
- 正規化を適用する
- インデックスと制約を設定する
- セキュリティとアクセス制御を考慮する
- スケーラビリティとパフォーマンスを考慮する

## 3. RDB一覧

| 特徴・観点       | PostgreSQL                       | MySQL                             | SQLite                 | Oracle DB            | SQL Server            |
| ---------------- | -------------------------------- | --------------------------------- | ---------------------- | -------------------- | --------------------- |
| ライセンス       | OSS（PostgreSQL License）        | OSS（GPL）                        | OSS（Public Domain）   | 商用                 | 商用（Express版あり） |
| 主な用途         | Web, 業務, BI, 分析, 拡張DBなど  | Webアプリ, CMS                    | 組み込み, モバイル     | 大規模業務システム   | 企業向けアプリ        |
| ストレージ形式   | マルチプロセス, WAL方式          | スレッド型, InnoDBが主            | 単一ファイル           | 高機能ストレージ     | NTFSに最適化          |
| 標準SQL準拠      | 非常に高い                       | やや弱め（制限や拡張あり）        | 最低限のみ             | 非常に高い           | 高い                  |
| JSONサポート     | json / jsonb 完全対応            | JSON型はあるがインデックス弱い    | なし（textとして扱う） | 有り                 | 有り                  |
| 拡張性           | 高（自作型・演算子・関数定義可） | 限定的                            | ほぼなし               | PL/SQLベースで高い   | CLRベースで高い       |
| 分析・集計機能   | ウィンドウ関数, CTE, FILTERなど  | 最近のバージョンで対応            | 弱い                   | 強力（分析系に特化） | 強力                  |
| トランザクション | 完全対応（REPEATABLE READなど）  | 一部制限（REPEATABLE READ非準拠） | 基本的に非対応         | 完全対応             | 完全対応              |
| 外部拡張         | PostGIS, TimescaleDB など多数    | 少なめ                            | なし                   | 独自機能多数         | BI連携強め            |

## 4. カーディナリティ

男女のカラムは低カーディナリティ
高カーディナリティ＝インデックス有効、低カーディナリティ＝インデックス不要

- b-tree
  - 2分探索のようにして、掘り下げていく
  - 親ノードの左には親ノードより小さい値、右には親ノードより大きい値をまとめる
  - 新たに追加する際に子ノードが埋まっていれば、

[B-Tree インデックスの基礎](https://zenn.dev/farstep/books/learn-database-index-basics/viewer/basics-of-b-tree-index)

## 5. 参考

- [データベースのスキーマとは？どのように設計しますか？](https://apidog.com/jp/blog/database-schema-definition-designing/)
- [Pythonで実装して理解する RDBパフォーマンスチューニング入門 ─ フルスキャンとB-treeインデックスの仕組み](https://qiita.com/take-yoda/private/ecc6e9b174b2e5e97406)

## 6. 検索用語とNoSQLの使用例

### 6.1. 検索関連の一般用語かどうか

- **ファジー検索（fuzzy search）**: 業界で定着した一般用語。曖昧一致・部分一致・表記ゆれを許容する検索手法を指す。検索エンジン、DB、IDEのファイルジャンプ機能などで広く使われる。英語でも"fuzzy search"/"fuzzy matching"として定着。
- **「検索軸」**: BIツールやデータ分析の文脈で「絞り込みの観点・ディメンション」という意味合いで使われることはあるが、業界標準用語というより説明用の比喩表現に近い。
- **「アイテム軸検索軸」**: 一般的な定着表現ではない。特定の記事・資料内で使われた独自の言い回しである可能性が高く、見かけた場合は文脈（出典）を確認する必要がある。

### 6.2. NoSQL採用例（Twitter）

Twitterはデータの性質によってRDBとNoSQLを使い分けている。

- **RDB（MySQL/PostgreSQLなど）**: ユーザープロフィールなど構造化データ・関係性の管理に使用。
- **NoSQL（Cassandraなど）**: ツイート本文、タイムライン、ハッシュタグなど大量・高スループットなデータの保存に使用。書き込み性能とスケーラビリティを優先する場面での典型的なNoSQL採用パターン。
- ハッシュタグは投稿時にインデックス化され、検索・トレンド集計に使われる。

## 7. 参考（NoSQL）

- [What is the software architecture of twitter?](https://www.designgurus.io/answers/detail/what-is-the-software-architecture-of-twitter)
- [NoSQL vs SQL: Performance with Twitter Data](https://twitterapi.io/articles/nosql-vs-sql-performance-twitter-data)
- [Storing, preprocessing and analyzing Tweets: Finding the suitable NoSQL system](https://arxiv.org/pdf/2005.01393)
