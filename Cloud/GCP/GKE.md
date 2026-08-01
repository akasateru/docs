GKE(Google Kubernetes Engine)はGoogle CloudのマネージドKubernetesサービス。クラスタはコントロールプレーンとworker nodeで構成される。

## 1. クラスタの構成要素

### 1.1. コントロールプレーン(Control Plane)

- Kubernetes APIサーバー、スケジューラ、etcdなどを管理する頭脳部分
- GKEでは基本的にGoogle側がフルマネージドで運用し、ユーザーからは直接見えない

### 1.2. worker node

- 実際にアプリケーションのPodがスケジュールされ、動く場所
- GCEのVMインスタンスとして起動する
- 各worker nodeで動いているもの
  - **kubelet**: コントロールプレーンと通信し、Podの起動・監視を担当するエージェント
  - **kube-proxy**: Service宛の通信をPodにルーティングするネットワークプロキシ
  - **container runtime**(containerdなど): 実際にコンテナを起動・実行する
  - 実行中の**Pod群**

## 2. Node Pool

- 同じ設定(マシンタイプ、ディスク、ラベルなど)を持つworker nodeの集合
- 用途別(例: CPU用/GPU用)に複数のNode Poolを作れる

## 3. Autopilot vs Standard

- **Standard**: ノード数・マシンタイプをユーザーが管理する
- **Autopilot**: ノード管理自体をGoogleに任せられるモード

## 4. Autoscaling

- 負荷に応じてNode Poolのノード数を自動増減できる(Cluster Autoscaler)
- ノードが故障・削除されると、その上のPodは別のノードに再スケジュールされる(Kubernetesの自己修復性の一部)
