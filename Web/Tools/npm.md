# npm / npx

Node.jsのパッケージ管理エコシステムにおける2つの基本コマンド。役割が異なる。

## 1. npm（Node Package Manager）

パッケージを**インストール・管理**するツール。プロジェクトに追加して使い続けるものはこちら。

```bash
npm install express     # プロジェクトの依存として追加（package.jsonに記録される）
npm install -D nodemon  # 開発時のみ使う依存として追加
npm run dev              # package.jsonのscriptsを実行
```

## 2. npx（Node Package eXecute）

パッケージを**インストールせずに一時的に実行**するツール。雛形生成やCLIツールの単発実行に使う。

```bash
npx express-generator my-app   # インストールせずコマンドだけ使って雛形生成、終わったら残らない
npx giget@latest nitro nitro-app  # テンプレートを一度だけ取得
```

## 3. 使い分けの目安

| コマンド | 目的 | 実行後パッケージは残るか |
| --- | --- | --- |
| `npm install X` | アプリに組み込んで使い続ける | 残る（`node_modules`に保存） |
| `npx X` | ツールを一度だけ実行する（雛形生成、CLI実行等） | 残らない（キャッシュのみ） |

判断基準は「これは自分のアプリのコードから継続的に呼び出すものか（→npm）」か「一度きりのコマンド実行で完結するものか（→npx）」。
