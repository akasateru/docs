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
