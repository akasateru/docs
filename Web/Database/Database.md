
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

## 6. NoSQL採用例（Twitter）

Twitterはデータの性質によってRDBとNoSQLを使い分けている。

- **RDB（MySQL/PostgreSQLなど）**: ユーザープロフィールなど構造化データ・関係性の管理に使用。
- **NoSQL（Cassandraなど）**: ツイート本文、タイムライン、ハッシュタグなど大量・高スループットなデータの保存に使用。書き込み性能とスケーラビリティを優先する場面での典型的なNoSQL採用パターン。
- ハッシュタグは投稿時にインデックス化され、検索・トレンド集計に使われる。

## 7. 参考（NoSQL）

- [What is the software architecture of twitter?](https://www.designgurus.io/answers/detail/what-is-the-software-architecture-of-twitter)
- [NoSQL vs SQL: Performance with Twitter Data](https://twitterapi.io/articles/nosql-vs-sql-performance-twitter-data)
- [Storing, preprocessing and analyzing Tweets: Finding the suitable NoSQL system](https://arxiv.org/pdf/2005.01393)

## 8. グラフ型データモデル

データを**ノード（頂点）**と**エッジ（辺）**の集合として表現するデータモデル。リレーショナルモデル（テーブル）やドキュメントモデルと並ぶ代表的なデータモデルの一つ。

- **ノード**: エンティティ（人、物、イベントなど）
- **エッジ**: ノード間の関係。方向性・ラベル・重みを持てる
- **プロパティグラフ**: ノードにもエッジにも属性（key-value）を持たせられるモデル（Neo4j, Amazon Neptuneなど）
- **RDFモデル**: 主語-述語-目的語のトリプルで表現するモデル（セマンティックウェブ、知識グラフで使用）

**得意なこと**: 「友達の友達」のような多段の関係をたどるクエリ、経路探索、推薦。リレーショナルDBだと大量のJOINが必要になる処理を、グラフでは隣接関係を辿るだけで高速に処理できる。

**代表用途**: SNSの人間関係、知識グラフ、不正検知（取引ネットワーク）、レコメンデーションシステム

### 8.1. ヘテロジニアスグラフ（Heterogeneous Graph）

**複数の種類のノード・エッジを持つグラフ**のこと。「ヘテロジニアス」＝「異種の」という意味の一般的な形容詞で、グラフ以外の文脈（例: CPU+GPUを組み合わせるヘテロジニアスコンピューティング）でも使われる。

- **ホモジニアスグラフ**（対義語）: ノードもエッジも1種類のみ（例: SNSの「ユーザー-フォロー-ユーザー」だけのグラフ）
- **ヘテロジニアスグラフ**: 複数タイプが混在する（例: 学術グラフの「著者」「論文」「会議」「トピック」といった複数ノードタイプと、「執筆する」「引用する」「所属する」といった複数エッジタイプ）

知識グラフはほぼ例外なくヘテロジニアスグラフである。近年ではグラフニューラルネットワーク（GNN）の分野でも、ノードタイプごとに異なる重み行列を使う **Heterogeneous GNN**（HAN, R-GCNなど）が発展している。

「ヘテロジニアスなグラフ型データモデル」＝複数種類のエンティティ・関係を持つグラフDB設計、という文脈で語られることが多い（知識グラフ構築、レコメンデーションシステムなど）。

## 9. Apache Cassandra

大量データを複数のコモディティサーバーに分散して扱うために設計された、無料でオープンソースの分散型NoSQLデータベース。もともとFacebookが開発し、後にApacheプロジェクトへ寄贈された。§6の「NoSQL採用例（Twitter）」で触れたCassandraの詳細。

### 9.1. 主な特徴

- **分散型アーキテクチャ**: マスターレス（単一障害点がない）なノード構成。複数のデータセンターにまたがるクラスタを非同期レプリケーションでサポート
- **CAP定理上の位置づけ**: 「一貫性」より「可用性」と「スケーラビリティ」を優先する設計。書き込みスループットが非常に高い用途に強い
- **ワイドカラム型データモデル**: 柔軟なスキーマで、疎（スパース）な列を大量に持つデータも効率的に扱える
- **線形スケーラビリティ**: ノードを追加するだけで読み書きスループットが線形に伸び、サービスを止めずに拡張可能
- **耐障害性**: データを複数ノードに複製するため、ハードウェア障害があってもデータが失われにくい

### 9.2. 現状のログ（2026-07-12時点）

- 最新の安定版は **Cassandra 5.0.8**（2026年4月リリース）。サポート対象バージョン系列は3つ
- 5.0系列の主要新機能:
  - **Storage-Attached Indexes (SAI)**: 効率的なセカンダリインデックス
  - **Vectorデータ型・検索**: SAI経由の近似最近傍探索（ベクトル検索対応、AI関連ワークロード向け）
  - **Unified Compaction Strategy (UCS)**: 適応型コンパクション
  - **Trie Memtables / Trie SSTables**: トライ構造ベースのメモリ/ディスク格納形式
  - **Dynamic Data Masking**: クエリ時に機密データを選択的にマスキング
- 5.0.8では6.0から**自動リペア機能（CEP-37）**をバックポート、`cassandra-stress`でのTLS 1.3自動ネゴシエーション対応なども追加

### 9.3. 参考

- [Apache Cassandra - Wikipedia](https://en.wikipedia.org/wiki/Apache_Cassandra)
- [What Is Cassandra? | IBM](https://www.ibm.com/think/topics/cassandra)
- [Releases · apache/cassandra](https://github.com/apache/cassandra/releases)
- [New Features | Apache Cassandra Documentation](https://cassandra.apache.org/doc/latest/cassandra/new/index.html)
