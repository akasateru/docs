
## 1. BigQuery

 Google Cloudのペタバイト規模の費用対効果に優れたフルマネージド型の分析データ ウェアハウス([BigQuery ドキュメント](https://docs.cloud.google.com/bigquery/docs?hl=ja))

## 2. BigQuery特有の構文

- `GROUP BY GROUPING SETS`: GROUP BY 句で列を複数指定して、それぞれの集計結果を合わせて一つの結果として返すための構文
- `GROUP BY CUBE`
- `GROUP BY ROLLUP`

### 2.1. 「エラーを NULL に変えてくれる」 便利な関数

- `SAFE_CAST`: 型変換に失敗してもエラーを出さずに、NULLを返してくれる関数
- `SAFE_DIVIDE(x, y)`: ゼロ除算（0で割る）エラーを防ぎ、`NULL` を返す。
- `SAFE.SUBSTR(string, position)`: 文字列の範囲外を指定してもエラーにならない。
- `SAFE.PARSE_DATE('%Y-%m-%d', string)`: 文字列から日付への変換に失敗しても `NULL` で逃げられる。

EXCEPT: 指定した列以外をすべて選択
REPLACE: 特定の列だけ計算処理を上書きして、他はそのまま選択
UNNEST: 配列をバラして行に展開。
ARRAY_AGG: 行をまとめて配列にする。

ワイルドカードテーブル (_TABLE_SUFFIX)

- 近似関数 (HyperLogLog)
  - APPROX_COUNT_DISTINCT: 誤差数%以内で、爆速でユニーク数を返す

- **`FARM_FINGERPRINT`**: 決定論的な整数ハッシュを生成（サンプリングに最適）。
- **`GENERATE_UUID`**: ランダムなUUIDを生成。

- スクリプト・一時関数 (TEMP FUNCTION)

## 3. Python

- job_config = bigquery.QueryJobConfig(query_parameters)

## 4. メモ

### 4.1. INFORMATION_SCHEMA (メタデータの取得)

BigQueryでは `INFORMATION_SCHEMA` ビューをクエリすることで、データセット、テーブル、ジョブなどのメタデータを取得できます。プロジェクト、データセット、またはリージョンレベルで修飾して使用します。

代表的な `INFORMATION_SCHEMA` のビュー（SCHEMATAの仲間たち）:

- **`INFORMATION_SCHEMA.SCHEMATA`**
  - データセット（スキーマ）のメタデータ。データセットの一覧や作成日時、ロケーションなどを取得。
- **`INFORMATION_SCHEMA.TABLES`**
  - テーブルとビューのメタデータ。テーブル一覧、作成日時、タイプ（BASE TABLE, VIEWなど）を取得。
- **`INFORMATION_SCHEMA.COLUMNS`**
  - カラム（列）のメタデータ。テーブルが持つカラムのリスト、データ型（DATA_TYPE）などを取得。
- **`INFORMATION_SCHEMA.VIEWS`**
  - ビューの定義（DDL）など、ビュー特有のメタデータを取得。
- **`INFORMATION_SCHEMA.ROUTINES`**
  - ユーザー定義関数（UDF）やストアドプロシージャのメタデータを取得。
- **`INFORMATION_SCHEMA.PARTITIONS`**
  - パーティション分割テーブルのパーティションごとのメタデータ（行数やストレージサイズなど）。
- **`region-[REGION].INFORMATION_SCHEMA.JOBS`** (例: `region-us.INFORMATION_SCHEMA.JOBS`)
  - 過去のジョブ（クエリ実行履歴、ロード、エクスポートなど）のメタデータ。実行時間、スキャンしたバイト数、エラーログなどを確認するのに便利。
- **`INFORMATION_SCHEMA.TABLE_STORAGE`**
  - テーブルのストレージ使用量（論理バイト数、物理バイト数、アクティブ/長期保存の区分など）に関する情報を取得。コスト分析に有用。

**クエリ例**:

```sql
-- 特定のデータセット内のテーブル一覧を取得
SELECT table_name, table_type
FROM `project_id.dataset_id.INFORMATION_SCHEMA.TABLES`;
```

## 5. 参考

- [データ ウェアハウスから自律型データ AI プラットフォームへ](https://cloud.google.com/bigquery?hl=ja#data-science)
