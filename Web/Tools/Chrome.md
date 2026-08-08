## 1. 拡張機能

### 1.1. markdown系

#### 1.1.1. Copy as Markdown

- 右クリックでマークダウン形式でコピーできる
- 何も選択せずに右クリックすると`[title](url)`の形式でダウンロードできる

#### 1.1.2. Youtube Speed Controler

- Youtubeなどの動画の速度をコントロールできる

#### 1.1.3. Youtube Download

- [Youtube Download](https://addoncrop.com/v27/youtube-downloader/)

## 2. DevTools

### 2.1. Disable cache（Networkタブ）

**Disable cache**: Network パネル上部にあるチェックボックス。ONにするとブラウザのHTTPキャッシュを無効化し、すべてのリクエストを毎回サーバーから取得し直す。

- 開発中にJS/CSS/画像などを変更してリロードしても、キャッシュされた古いファイルが使われて変更が反映されないことを防ぐために使う。
- **DevToolsを開いている間だけ**有効。DevToolsを閉じると通常のキャッシュ挙動に戻る。
- チェックを入れるとリロードごとに全リソースを再取得するため、動作確認は正確になるが読み込みは遅くなる。
- Service Worker のキャッシュには影響しない（別途 Application タブでの操作が必要）。

| 用途 | 方法 |
|---|---|
| 開発中ずっとキャッシュ無効にしたい | Network タブの Disable cache にチェック |
| 今この一回だけキャッシュを無視して確認したい | リロードボタン右クリック →「キャッシュの消去とハード再読み込み」（1回限りの強制リロード） |
