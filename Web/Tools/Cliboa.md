# Cliboa

BrainPad社が公開しているPython製のOSS ETL(ELT)パイプラインフレームワーク。様々なDB・ストレージ・外部サービス間でのデータの取得(Extract)・変換(Transform)・転送(Load)処理をパイプラインとして構築できる。

- リポジトリ: [BrainPad/cliboa](https://github.com/BrainPad/cliboa)

---

## 特徴

- **YAMLベースの設定**: ETL処理のパイプラインをコードを書かずにYAMLで定義できる
- **モジュール拡張が容易**: デフォルトモジュールで足りない処理は少ないステップで自作モジュールを追加可能
- **対応環境**: macOS / 各種Linux(Debian, Ubuntu, CentOS, RHEL等)。Python 3.7以降、依存管理にpoetryを使用

---

## 想定用途

CSVファイルの取得・加工、DB間のデータ連携、外部APIからのデータ取得〜整形〜格納など、いわゆる「データ基盤の前処理パイプライン」を、フルスクラッチでPythonを書かずにYAML設定+軽量なモジュールで組める点が特徴。

---

## 参考

- [GitHub - BrainPad/cliboa](https://github.com/BrainPad/cliboa)
- [default_etl_modules.md](https://github.com/BrainPad/cliboa/blob/master/docs/default_etl_modules.md)
- [yaml_configuration.md](https://github.com/BrainPad/cliboa/blob/master/docs/yaml_configuration.md)
- 会話ログ(2026-08-05): Cliboaの概要調査
