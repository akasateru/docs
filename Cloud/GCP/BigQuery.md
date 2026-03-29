
## 1. BigQuery

 Google Cloudのペタバイト規模の費用対効果に優れたフルマネージド型の分析データ ウェアハウス([BigQuery ドキュメント](https://docs.cloud.google.com/bigquery/docs?hl=ja))

## 2. 構文

### 2.1. 「エラーを NULL に変えてくれる」 便利な関数

- `SAFE_CAST`: 型変換に失敗してもエラーを出さずに、NULLを返してくれる関数
- `SAFE_DIVIDE(x, y)`: ゼロ除算（0で割る）エラーを防ぎ、`NULL` を返す。
- `SAFE.SUBSTR(string, position)`: 文字列の範囲外を指定してもエラーにならない。
- `SAFE.PARSE_DATE('%Y-%m-%d', string)`: 文字列から日付への変換に失敗しても `NULL` で逃げられる。

## 3. 参考

-
- [データ ウェアハウスから自律型データ AI プラットフォームへ](https://cloud.google.com/bigquery?hl=ja#data-science)
