# Vite

## 1. 概要

- フロントエンド開発を劇的に高速化するために作られた、次世代のビルドツール。
- Vue.jsの作者であるEvan You氏によって開発され

## 2. 使い方

「プロジェクトを作る」「開発する」「公開用に固める」の3ステップ

`npm create vite@latest`を打ち以下を選択
- Project name: 好きなフォルダ名を入力（例: my-app）
- Select a framework: 使いたいものを選びます（Vue, React, Vanillaなど）
- Select a variant: TypeScriptを使うかどうかを選びます

## 3. vite.config.ts

```ts
// vite.config.ts の例
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, // 3000番ポートで起動
    open: true  // 起動時に自動でブラウザを開く
  }
})
```

## 4. 本番用にビルド

- `npm run build`を実行すると、プロジェクト内に dist というフォルダが生成される
- dist フォルダの中身を、サーバー（Vercel, Netlify, AWS S3など）にアップロードすれば公開完了

## 5. dist・rollupOptions・ベンダーライブラリ

### 5.1. distとは

ビルド後の成果物（HTML/CSS/JSの静的ファイル）が出力されるディレクトリ。`src/`は開発者が書くソースだが、`dist/`はそのままWebサーバー（GCS, S3, Firebase Hostingなど）にアップロードして配信できる最終成果物。`build.outDir`で出力先ディレクトリ名を変更できる（デフォルトは`dist`）。

### 5.2. rollupOptions

Viteは本番ビルド時に内部で**Rollup**（後述）というバンドラーを使っており、`rollupOptions`はそのRollupに直接渡す設定項目。

```ts
build: {
  rollupOptions: {
    input: {
      main: './index.html',
      admin: './admin.html', // 複数エントリーポイントを指定する例
    },
    output: {
      manualChunks: { ... }, // ファイル分割のルール
    },
    external: ['lodash'],    // バンドルに含めず外部読み込みにするライブラリ
  },
}
```

Viteが提供する設定だけでは足りない、より細かいバンドル制御をしたい場合に使う。

### 5.3. ベンダーライブラリの分割

**ベンダーライブラリ**とは、自分で書いたコードではなく`npm install`で入れた外部ライブラリ（React, Lodashなど）のこと。何も設定しないと自分のコードとライブラリが1つの巨大なJSファイルに混ざり、コードを1行変更しただけでファイル名（ハッシュ）が変わってユーザーが全体を再ダウンロードすることになる。

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
      },
    },
  },
}
```

こう分割すると、頻繁に変わる自分のコードと、めったに変わらないライブラリ本体のファイルを分離でき、ライブラリ側はブラウザキャッシュされ続けるためキャッシュ効率が上がる。

## 6. Rollupとは

Viteが本番ビルド（`vite build`）時に内部で使用している**JavaScriptモジュールバンドラー**。複数に分かれたJS/TSファイルを、ブラウザが効率よく読み込める少数のファイルにまとめる。

- 最大の特徴は**Tree Shaking**：ES Modulesの`import/export`を静的に解析し、実際には使われていないコードをバンドル結果から自動的に除外する最適化。
- React・VueなどのライブラリやnpmパッケージのビルドにもRollupが使われることが多い。

| フェーズ | 使うツール | 理由 |
| --- | --- | --- |
| 開発時（`vite dev`） | Viteの独自サーバー（esbuild） | ブラウザネイティブESMを使い変換を最小限にして高速起動 |
| 本番ビルド（`vite build`） | 内部でRollup | Tree Shakingなど成熟した最適化を活用 |

配信構成（DNS接続やフロント/バックの振り分けパターン）については[フロントエンド・バックエンドの配信アーキテクチャ](../DevOps/フロントエンド・バックエンドの配信アーキテクチャ.md)を参照。
