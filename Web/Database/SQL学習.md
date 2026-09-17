# SQL学習

SQLを効率よく学ぶための進め方と、つまずきやすいポイントの整理。

## 1. 効率的な学習の進め方

SQLは「読んで理解する」より「書いて詰まる」ことで身につくスキルなので、座学と演習の比率は3:7くらいが目安。

1. **一冊をざっと通読**（1〜2日、写経はせず概念だけ拾う）: SELECT〜JOIN〜集約〜サブクエリ〜ウィンドウ関数の全体像を掴む
2. **手を動かせる環境で演習**: SQLZoo、Leetcode Database、PostgreSQL Exercisesあたりが無料で実践的
3. **詰まったところだけ本に戻って読み直す**（通読の2周目は不要、辞書的に使う）

BigQueryやCloud SQLなど実務で既にRDBに触れているなら、基礎のSELECT/JOINは飛ばして、ウィンドウ関数・パフォーマンスチューニング（実行計画、インデックス）・DDD文脈でのクエリ設計に時間を割いた方が費用対効果が高い。

### 1.1. つまずきやすいポイント

- JOINの種類（INNER/LEFT/RIGHT）とNULLの扱い
- GROUP BYとHAVINGの違い、集約前後のWHERE
- サブクエリ vs CTE（WITH句）の使い分け
- ウィンドウ関数（ROW_NUMBER, RANK, PARTITION BY）

## 2. 相関サブクエリとウィンドウ関数の違い

### 2.1. 相関サブクエリ

外側のクエリの各行に対して、内側のクエリが1行ずつ再実行される。

- 行ごとに独立して評価されるため、行数分だけスキャンが走りやすい（実装によってはオプティマイザが最適化するが、基本は遅くなりがち）
- 例: 各部門の平均給与より高い社員を抽出

```sql
SELECT *
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees e2
  WHERE e2.department_id = e.department_id
);
```

### 2.2. ウィンドウ関数

`OVER (PARTITION BY ... ORDER BY ...)` で、パーティションごとの集計・順位付けを1回のスキャンで計算する。

- 集計結果を各行に「付加」できる（GROUP BYと違って行が潰れない）
- 一般的に相関サブクエリより高速（特にBigQueryのような分散処理エンジンでは顕著）

```sql
SELECT *,
  AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary
FROM employees
QUALIFY salary > dept_avg_salary;  -- BigQueryならQUALIFYが使える
```

### 2.3. 使い分けの目安

| 観点 | 相関サブクエリ | ウィンドウ関数 |
| --- | --- | --- |
| パフォーマンス | 行ごとに再評価、遅くなりやすい | 1パスで計算、高速 |
| 用途 | EXISTS/NOT EXISTSなど存在チェック向き | ランキング、移動平均、累積和など |
| 可読性 | シンプルな条件なら直感的 | 複雑な分析処理で強力 |

BigQuery中心の業務であれば、集計や順位付けが絡む場面はウィンドウ関数一択で考えて大丈夫。相関サブクエリはEXISTS系の存在確認くらいに留めておくとパフォーマンス面で無難。

## 3. 参考

- [Database.md](Database.md)
