# 1. CircleCI

## 1.1. 概要

CircleCIはクラウド型のCI/CDサービス。リポジトリの `.circleci/config.yml` にパイプラインを定義し、push・PR作成などのイベントをトリガーにビルド・テスト・デプロイを自動実行する。

## 1.2. 設定ファイルの基本構造

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout
      - run: npm ci
      - run: npm test

workflows:
  main:
    jobs:
      - build
```

## 1.3. 主要な概念

| 概念 | 内容 |
| ----------- | -------------------------------------------------------------- |
| Job | 一連のステップ（コマンド）をまとめた実行単位 |
| Workflow | 複数のJobを順序・条件（並列実行、依存関係）付きで組み合わせたもの |
| Executor | Jobを実行する環境（Docker, machine, macOSなど） |
| Orb | 再利用可能な設定のパッケージ（例: AWS CLI連携、Slack通知など） |

## 1.4. キャッシュと高速化

- `save_cache` / `restore_cache` で依存パッケージ（`node_modules` など）をキャッシュし、ビルド時間を短縮する。
- Workflow内でJobを並列実行することで、テストとLintなど独立した処理を同時に走らせられる。
- テストの並列分割（Test Splitting）機能で、大規模なテストスイートを複数コンテナに分散実行できる。

## 1.5. デプロイフローの一般的な流れ

1. `main` ブランチへのマージをトリガーにビルド・テストJobが走る。
2. テストが通過したら、承認ステップ（Approval Job）を挟んで本番デプロイJobを手動トリガーする構成も可能。
3. デプロイ結果はSlack通知Orbなどでチームに共有する。

## 1.6. 参考

- [CircleCI公式ドキュメント](https://circleci.com/docs/)
