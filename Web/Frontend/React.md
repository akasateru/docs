# React

UIをコンポーネント単位で宣言的に構築するためのJavaScriptライブラリ。SPA専用のフレームワークではなく、SPA化はあくまで設計判断の一つ。

## 1. SPA（Single Page Application）

### 1.1. 概要

- **単一のHTMLページ上で動作するWebアプリケーション**のこと。
- 従来のMPA（Multi Page Application）はページ遷移のたびにサーバーへリクエストしてHTMLを丸ごと再取得するが、SPAは最初に一度だけHTMLを読み込み、以降はJavaScriptでDOMを部分的に更新する。
- ルーティングもJS側で処理する（`react-router`など）。URLが変わっても実際には別ページに遷移していない。

### 1.2. メリット・デメリット

- メリット: 画面遷移が高速でネイティブアプリに近いUXになる。フロントエンドとバックエンドの責務が分離しやすい（APIサーバー化）。
- デメリット: 初回読み込みが重くなりがち（JSバンドルが大きい）。SEO対策が難しい場合がある。状態管理が複雑になりやすい。

### 1.3. 対義語的な概念

- **MPA**: ページ遷移ごとにサーバーがHTMLを都度生成して返す従来型。
- **SSR（Server Side Rendering）**: Next.jsなどでサーバー側でHTMLを事前生成し、SPAの弱点（初回表示・SEO）を補う手法。

## 2. Reactのメリット ≠ SPA

- SPAはReactのメリットの一つに過ぎず、イコールではない。
- Reactそのものの本質的なメリット:
  - **コンポーネント指向**: UIを再利用可能な部品に分割して管理できる。
  - **宣言的UI**: 「状態(state)がこうなったらUIはこう見える」と書くだけで、DOM操作の手続きを自分で書かなくていい。
  - **仮想DOM（Virtual DOM）**: 差分計算により効率的にDOMを更新する。
  - **エコシステムの大きさ**: ライブラリ、求人、情報量が豊富。
- **ReactはSPAを作るための機能をデフォルトで持っていない**。ルーティングも状態管理もReact本体には含まれない。SPAにするかどうかは設計判断であり、Reactを使う＝SPAになるわけではない。

| 用途 | 説明 |
|---|---|
| SPA | react-router等でクライアント側ルーティング |
| SSR/SSG | Next.jsなどでサーバー側レンダリング（SPAではない、あるいはハイブリッド） |
| 部分的な利用 | 既存のMPAサイトの一部（例: 検索ウィジェットのみ）にReactを埋め込む |

## 3. SPA採用にあたり必要な設定

素のReact（`create-react-app`や`Vite`）だけではSPAとして完全には動かない。

### 3.1. ルーティングライブラリの導入

```bash
npm install react-router-dom
```

URLとコンポーネントの対応付けをJS側で行う。

### 3.2. サーバー側のフォールバック設定（見落としがち）

- SPAは実体としては `index.html` 1枚しか存在しない。ユーザーが `/about` に直接アクセス・リロードすると、サーバーは物理的な `/about` ファイルを探して**404になってしまう**。
- 対策として、サーバー側で「どのパスへのリクエストも `index.html` を返す」設定が必要。
  - Nginx: `try_files $uri /index.html;`
  - Vercel/Netlify: 設定ファイルでリライトルールを追加（`vercel.json`の`rewrites`など）
  - Express: catch-allルートで`index.html`を返す

### 3.3. SEO対策（必要な場合）

- SPAはJSでコンテンツを描画するため、検索エンジンのクローラーに空のHTMLしか見えないことがある。
- `react-helmet` などでメタタグを動的に設定。
- どうしても必要ならSSR（Next.jsへの移行）を検討。

### 3.4. コード分割（任意だが推奨）

- ページが増えるとJSバンドルが肥大化するため、`React.lazy` + `Suspense` で遅延読み込みを設定するのが一般的。

## 4. React Server Components（RSC）とディレクティブ

### 4.1. RSCの本質

- 「どのサーバーで実行するか」を選ぶ機能ではなく、**コンポーネント単位でサーバー環境で実行するかクライアント環境で実行するかを宣言できる**仕組み。
- デフォルトはServer Component。`.tsx`ファイルに何も書かなければサーバー上でレンダリングが完結し、生成物（HTML相当のペイロード）だけがブラウザに送られる。JSバンドルにも含まれない。
- DBアクセスやAPIキーなど秘匿情報を扱う処理をサーバー側に閉じ込めつつ、クライアントに送るJSバンドルサイズを削減できるのが狙い。
- `useState`などのReact hooksや`onClick`のようなイベントハンドラはServer Componentでは使えない（サーバー上で1回だけ実行されて終わりのため、インタラクティブな状態を持てない）。これらが必要な部分だけをClient Componentに切り出す。

### 4.2. ディレクティブとは

- ファイル（または関数）の**先頭に置く特別な文字列リテラル**で、コンパイラやランタイムに「このコードをどう扱うか」を指示するメタ情報。実行される命令ではなく宣言。
- JS標準の例: `"use strict"`。エンジンがこれを読み取って厳格モードで動作する。
- Reactのビルドツールが独自に解釈する拡張ディレクティブとして`"use client"`と`"use server"`がある。

### 4.3. `use client` / `use server`

```tsx
"use client";

export default function Button() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

- `"use client"`をファイル先頭に書くと、そのファイルとその依存先はクライアントバンドルに含まれ、ブラウザで実行されるClient Componentになる。

```tsx
"use server";

export async function submitForm(formData: FormData) {
  await db.insert(...);
}
```

- `"use server"`は逆に、その関数がサーバー上でのみ実行され、クライアントから呼び出し可能なエンドポイント（Server Action）として扱われることを示す。