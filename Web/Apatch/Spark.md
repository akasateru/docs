# 1. Apache Spark

## 1.1. 概要

Apache Sparkは大規模データの分散処理フレームワーク。旧来のMapReduceと異なり、処理中のデータをできる限りメモリ上に保持することで高速な反復処理を実現する。バッチ処理、ストリーミング、機械学習、SQLクエリまで統一的なAPIで扱える。

## 1.2. 主要コンポーネント

| コンポーネント   | 役割                                       |
| ------------------ | --------------------------------------------- |
| Spark Core          | RDD（分散データセット）の基本処理エンジン    |
| Spark SQL           | DataFrame/SQLでの構造化データ処理             |
| Spark Streaming     | ストリーミングデータのマイクロバッチ処理      |
| MLlib               | 分散環境向けの機械学習ライブラリ              |

## 1.3. RDDとDataFrame

- **RDD（Resilient Distributed Dataset）**: Sparkの基本データ構造。低レベルAPIで柔軟だが最適化はコード側の工夫に依存する。
- **DataFrame**: スキーマを持つ表形式データ。Catalyst Optimizerによってクエリが自動最適化されるため、実務では基本的にDataFrame/Spark SQLを使うことが多い。

## 1.4. 処理の仕組み（遅延評価）

- Sparkの変換処理（`map`, `filter` など）は遅延評価（Lazy Evaluation）で、実際にはDAG（有向非巡回グラフ）として計画が組み立てられるだけ。
- `count()` や `collect()` などのアクションが呼ばれた時点で初めて実行計画がジョブとして走る。
- これにより不要な中間データの計算を省略し、実行計画全体を最適化できる。

## 1.5. クラスタ構成

- **Driver**: アプリケーション全体を制御し、実行計画をタスクに分割する。
- **Executor**: 各Workerノード上でタスクを実際に処理する。
- **Cluster Manager**: リソース割り当てを管理（YARN、Kubernetes、Spark単体のStandaloneモードなど）。

## 1.6. 参考

- [Apache Spark公式ドキュメント](https://spark.apache.org/docs/latest/)
