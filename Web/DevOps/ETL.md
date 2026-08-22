# 1. ETL

データを別システムへ移動・統合する際の代表的な処理パターン。Extract（抽出）・Transform（変換）・Load（格納）の3ステップからなる。

## 1.1. 3つのステップ

- **Extract（抽出）**: DB・API・ログファイル・SaaSツールなど複数ソースからデータを取り出す
- **Transform（変換）**: クレンジング（欠損値・重複処理）、型変換・フォーマット統一、結合・集計、ビジネスルール適用（個人情報マスキング等）を行う
- **Load（格納）**: 変換済みデータをDWH・データレイク・DBなど最終的な保存先に書き込む

## 1.2. ETL と ELT

近年はクラウドDWHの計算資源を活用する ELT（Extract → Load → Transform）も主流。

| 項目 | ETL | ELT |
| --- | --- | --- |
| 変換場所 | ロード前（専用サーバー） | ロード後（DWH内、BigQuery/Snowflake等） |
| 向き | 変換ロジックが複雑な従来型 | クラウドDWHのスケーラビリティ活用、dbt等と相性良し |
| 生データ保持 | されないことが多い | 生データも保持しやすい |

# 2. 主要ツール比較

| ツール | 分類 | 特徴 | 向いてる場面 |
| --- | --- | --- | --- |
| Airflow | オーケストレーション | DAGでタスク依存関係管理、Pythonで柔軟に記述 | 複雑なワークフロー全体の制御 |
| dbt | Transform専門 | SQL変換、DWH内で完結（ELTのT） | DWH内のモデリング・テスト・ドキュメント化 |
| Fivetran / Airbyte | Extract/Load | コネクタ豊富、ノーコードでE+L | SaaSデータの取り込み自動化 |
| Embulk / [Digdag](Digdag.md) | E+L / オーケストレーション | プラグイン形式、Treasure Data発 | オンプレ〜ハイブリッド環境 |
| [Cliboa](../Tools/Cliboa.md) | E+T+L | YAML設定ベース、BrainPad製OSS | Pythonを書かずにETLパイプライン構築 |
| Dagster / Prefect | オーケストレーション | Airflowより開発体験重視、型安全 | データ資産（asset）ベースの管理 |
| Talend / Informatica | 統合ETLスイート | GUI中心、エンタープライズ向け | 非エンジニアも扱う大規模組織 |
| Spark（PySpark） | 分散処理 | 大規模データのTransform | ペタバイト級、複雑な変換ロジック |

## 2.1. Embulk と Digdag の関係

両方とも Treasure Data 発の OSS で役割分担が明確に分かれている。

| | 役割 | 例えるなら |
| --- | --- | --- |
| Embulk | データ転送（E+L）専門。DB↔DB、DB↔ファイルをプラグインで接続 | Fivetran/Airbyteの軽量版・OSS版 |
| [Digdag](Digdag.md) | ワークフロー・スケジューリング（タスク順序制御） | Airflowの軽量版 |

Digdag が「いつ・どの順で・何を実行するか」を制御し、実際のデータ移動は Embulk が担当する。AirflowとFivetranの関係と構造は同じで、「軽量なセット」というポジショニング。

```yaml
# Digdag のワークフロー定義（.dig ファイル）
+extract_mysql:
  sh>: embulk run mysql_to_s3.yml.liquid   # Embulkでデータ転送
+transform:
  sh>: dbt run                              # dbtで変換
+notify:
  sh>: curl -X POST slack-webhook           # 完了通知
```

## 2.2. モダンデータスタックの具体例（Fivetran → dbt → Airflow/Dagster）

各ツールが専門特化した役割を持ち、Airflow/Dagster が指揮者として全体を統括する構成。

```text
[Salesforce, Stripe, MySQL, Google Analytics ...]
         ↓  Fivetranが毎日自動でデータ取得
   [DWH: BigQuery / Snowflake の raw層]
         ↓  dbt run コマンドでSQL変換を実行
   [DWH内の staging層 → mart層（整形済みテーブル）]
         ↓  BIツールやMLモデルが利用
   [Looker, Tableau, ML pipeline など]
```

Fivetranは自動でデータを取得するが、「Fivetranの同期完了後にdbtを実行する」という順序制御が必要になる。この順序制御をAirflow/Dagsterが担う。

```python
with DAG("elt_pipeline", schedule="0 3 * * *") as dag:

    wait_fivetran = FivetranOperator(
        task_id="trigger_fivetran_sync",
        connector_id="salesforce_connector",
    )
    run_dbt = BashOperator(
        task_id="run_dbt_transform",
        bash_command="dbt run --project-dir /app",
    )
    test_dbt = BashOperator(
        task_id="test_dbt_models",
        bash_command="dbt test --project-dir /app",   # データ品質チェック
    )
    refresh_dashboard = PythonOperator(
        task_id="refresh_looker_dashboard",
        python_callable=trigger_looker_refresh,
    )

    wait_fivetran >> run_dbt >> test_dbt >> refresh_dashboard
```

役割分担:

| ツール | やらないこと | やること |
| --- | --- | --- |
| Fivetran | 変換ロジック、スケジュール管理の柔軟性 | SaaSからのデータ取得を「コネクタ選ぶだけ」で自動化 |
| dbt | データ取得、タスクのスケジューリング自体 | SQL変換のバージョン管理・テスト・ドキュメント化 |
| Airflow/Dagster | データ取得・変換のロジック自体 | 「いつ・どの順で動かすか」「失敗したら通知」の統括 |

1日の流れの例:

1. 朝3時、AirflowがFivetranの同期をトリガー（または完了を待機）
2. Fivetran完了を検知したら `dbt run` を実行
3. `dbt test` でデータ品質チェック（NULLがないか、重複がないか等）
4. 全部成功したらLookerダッシュボードを更新、Slackに完了通知
5. 途中で失敗したら（例: dbt testでエラー）Airflow UIで赤く表示され、Slackにアラート

# 3. dbt の正体

dbt は「Pythonライブラリ」と呼ぶには少しずれがある。

- **配布形態**: `pip install dbt-core` でインストールするPythonパッケージ
- **主な記述言語**: 実際に書くのは基本的に **SQL + Jinjaテンプレート**（`.sql`ファイル）。Pythonコードでロジックを書くわけではない
- **例外**: dbtには「Pythonモデル」機能もあり、Snowflake/Databricks/BigQuery上でpandas/PySparkのDataFrame処理を書ける（ただし主流はSQL）
- **正体**: 実質は「SQLの変換ロジックを管理するフレームワーク/CLIツール」。Airflowのように Python API を直接叩くタイプとは性質が違う

イメージとしては「Pythonで作られた、SQL変換の依存関係管理・テスト・ドキュメント生成ツール」。

# 4. Airflow

「決まった時刻に、決まった順番でタスクを実行し、失敗したら教えてくれる」ツール。中身は「タスクの依存関係グラフ（DAG）を定義するPythonスクリプト」。

## 4.1. 具体例: 日次売上レポートを作るDAG

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG("daily_sales_report", schedule="0 6 * * *", start_date=datetime(2026, 1, 1)) as dag:

    extract = PythonOperator(
        task_id="extract_from_db",
        python_callable=extract_sales_data,
    )
    transform = PythonOperator(
        task_id="transform_data",
        python_callable=clean_and_aggregate,
    )
    load = PythonOperator(
        task_id="load_to_warehouse",
        python_callable=load_to_bigquery,
    )
    notify = PythonOperator(
        task_id="send_slack_notification",
        python_callable=notify_slack,
    )

    extract >> transform >> load >> notify   # この順番で実行、失敗したらそこで止まる
```

## 4.2. Airflow UI（Web画面）でできること

- 毎日6時に自動実行され、各タスクが成功（緑）/失敗（赤）で色分け表示される
- どのタスクで失敗したか一目でわかり、そのタスクだけ再実行できる
- 過去の実行履歴、実行時間、ログを全部確認できる
- タスク間の依存関係をグラフで可視化（DAG=有向非巡回グラフ）

cronで済ませていたバッチ処理を、依存関係・リトライ・可視化・履歴管理付きで管理できるようにしたもの、というのがAirflowのイメージ。

# 5. Spark / PySpark

Spark は「大量データをメモリ上で分散並列処理するエンジン」。PySpark はそれをPythonから操作するためのAPI。

- Sparkは元々Scala/JVMベースの分散処理フレームワーク
- PySparkはそれをPythonから呼び出せるようにしたラッパー。実行はJVM上のSparkエンジンが行い、Python側はほぼインターフェースの役割（書き味はPandasに近いが裏側は別物）
- Hadoop MapReduceの後継として登場、メモリ処理でMapReduceより高速
- SQL的に書ける（Spark SQL）、DataFrame API、ストリーミング処理（Spark Streaming）も可能
- Databricksは「Sparkをマネージドで使いやすくした商用プラットフォーム」

```python
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()
df = spark.read.parquet("s3://bucket/data/")
df.filter(df.amount > 1000).groupBy("category").count().show()
```

## 5.1. なぜ必要か

1台のマシンでは処理しきれない（数百GB〜数TB）データを、複数マシンに分割して同時処理するため。

```text
1億行のログデータを「エラー種別ごとに集計」したい
   ↓
Sparkが自動でデータを10台のマシンに分割
   ↓
各マシンが担当分を並列で集計（1000万行ずつ）
   ↓
最後に結果をマージ
```

## 5.2. dbt との違い

dbtはDWH（Snowflake/BigQuery等）の計算資源に処理を委譲するだけ（dbt自体は計算しない）。Sparkは自身が分散計算エンジンとして処理を実行する。データ量やユースケースが異なる（dbt=DWH内SQL変換、Spark=大規模・複雑な処理やDWH外のデータレイク処理）。

# 6. 冪等性・リトライ設計

ETLで最重要な設計原則。

## 6.1. 冪等性（Idempotency）とは

同じ処理を何度実行しても結果が変わらないこと。リトライや再実行が安全にできる。

## 6.2. 実現パターン

- **Upsert / Merge**: `MERGE INTO target USING source ON target.id = source.id WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...` のようにINSERTのみだと再実行で重複が発生するため避ける
- **パーティション単位の洗い替え（Delete-Insert）**: `DELETE FROM target WHERE date = '対象日'` してから同範囲をINSERTし直す。日次バッチでよく使うパターン
- **一意キー + 重複排除**: 処理ログに `run_id` や `batch_id` を持たせ、同一バッチの再投入を検知してスキップ
- **トランザクション境界**: Load処理を1トランザクションにまとめ、失敗時は全ロールバック（部分的な書き込みを残さない）

## 6.3. リトライ設計のポイント

- **リトライ対象の見極め**: 一時的エラー（タイムアウト、レート制限）のみリトライする。データ不整合エラーはリトライしても直らない
- **指数バックオフ**: 失敗のたびに待機時間を増やす（1s→2s→4s...）
- **最大試行回数の設定**: 無限リトライは避ける
- **チェックポイント**: 大量データ処理では途中から再開できるようにする（全部やり直さない）
- **DLQ（Dead Letter Queue）**: リトライしても失敗し続けるデータは隔離して後で調査

冪等性が担保されていれば「リトライ=ただの再実行」で済むため、この2つはセットで設計するのが鉄則。

# 7. CDC（Change Data Capture）との違い

CDCは「変更されたデータだけを検知して取得する」仕組み・手法。ETLとは対立概念ではなく、ETLのExtract部分の一手法という位置づけ。

| | バッチETL（全件/差分抽出） | CDC |
| --- | --- | --- |
| 抽出方法 | 定期的にクエリを投げてデータ取得 | DBのトランザクションログ（binlog/WAL等）を監視 |
| タイミング | 定時実行（日次、時間次等） | ほぼリアルタイム（ストリーミング） |
| ソースへの負荷 | クエリ負荷がかかる | ログ読み取りのみ、本番DBへの負荷が小さい |
| 検知できる変更 | クエリ条件次第（更新日時カラム等が必要） | INSERT/UPDATE/DELETE全て正確に捕捉 |
| 代表ツール | 自作バッチ、dbt incremental | Debezium, Fivetran（CDCモード）, AWS DMS |

## 7.1. 具体例

- **バッチ差分抽出**: `WHERE updated_at > '前回実行時刻'` でクエリする。更新日時カラムがないテーブルや物理削除には対応できない
- **CDC**: MySQLのbinlogを読んで「id=5のレコードがUPDATEされた」を直接検知する。リアルタイム同期、削除も検知可能

## 7.2. 使い分け

- リアルタイム性が不要 → バッチETLで十分、シンプル
- リアルタイム同期が必要、DBへの負荷を抑えたい、削除も正確に検知したい → CDC

最近のモダンデータスタックでは「Fivetran/AirbyteでCDC的にE+L → dbtでT」という構成がよく採用される（[2.2. モダンデータスタックの具体例](#22-モダンデータスタックの具体例fivetran--dbt--airflowdagster)参照）。
