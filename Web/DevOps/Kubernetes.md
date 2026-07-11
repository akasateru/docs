# 1. Kubernetes

## 1.1. 概要

Kubernetes（K8s）はコンテナ化されたアプリケーションのデプロイ・スケーリング・運用を自動化するオーケストレーションツール。単一のDockerホストでは難しい、複数ノードにまたがるコンテナ群の管理を宣言的に行える。

## 1.2. 主要リソース

| リソース    | 役割                                                     |
| ------------ | ----------------------------------------------------------- |
| Pod          | 最小のデプロイ単位。1つ以上のコンテナをまとめたもの         |
| Deployment   | Podのレプリカ数やアップデート戦略を管理                     |
| Service      | Pod群への安定したアクセス経路（ロードバランシング）を提供   |
| Ingress      | 外部からのHTTP(S)トラフィックをServiceにルーティング         |
| ConfigMap    | 環境変数・設定ファイルなど機密でない設定情報を管理           |
| Secret       | パスワードやAPIキーなど機密情報を管理                       |

## 1.3. アーキテクチャ

- **Control Plane**: クラスタ全体の状態を管理（API Server, Scheduler, Controller Manager, etcd）。
- **Node（Worker）**: 実際にPodが動作するマシン。kubeletがControl Planeと通信し、Podの起動・監視を行う。

## 1.4. 宣言的な管理の考え方

- Kubernetesはマニフェスト（YAML）で「あるべき状態」を宣言し、実際の状態がそれに一致するようControllerが継続的に調整する（Reconciliation Loop）。
- Podが異常終了した場合も、Deploymentが指定されたレプリカ数を維持するよう自動的に新しいPodを起動する。

## 1.5. よく使うkubectlコマンド

```bash
kubectl get pods                     # Pod一覧を確認
kubectl describe pod <pod-name>      # Podの詳細・イベントを確認
kubectl logs <pod-name>              # コンテナのログを確認
kubectl apply -f deployment.yaml     # マニフェストを適用
kubectl rollout restart deployment <name>  # ローリング再起動
```

## 1.6. 参考

- [Kubernetes公式ドキュメント](https://kubernetes.io/ja/docs/home/)
