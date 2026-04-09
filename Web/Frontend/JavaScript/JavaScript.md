
addEventListener
2. 基本構文

# 1. 基本構文

## 1.1. 変数宣言

- `const` → 初期化必須・不変
- `let` → 再代入可
- `var` → 使わない（巻き上げやスコープが問題）

複雑なHTML構造になっている場合は変換に失敗してクリップボードに**コピーされない**か、期待したMarkdown記法にならない場合がある。

- **ツール名:** **MarkDownload** (Chrome / Firefox 拡張)
- **特徴:** Webページを表示した状態でこのボタンを押すと、**表も含めてすべてMarkdown形式に変換された状態**でプレビュー・ダウンロードできます。
- **メリット:** 表の枠組みだけでなく、リンクや画像パスも適切に処理してくれます。

### 1.1.1. 走査・変換系

| メソッド            | 説明                             | 返り値      |
| ------------------- | -------------------------------- | ----------- |
| `forEach(callback)` | 各要素に副作用ありの処理を実行   | `undefined` |
| `map(callback)`     | 各要素を変換して新しい配列を返す | 新しい配列  |
| `flatMap(callback)` | `map` + `flat(1)` を同時に行う   | 新しい配列  |
| `filter(callback)`  | 条件に一致する要素だけ返す       | 新しい配列  |

padStart：0埋めしてくれる
正規表現リテラル：//で囲うと正規表現と判断される

### 1.1.2. Map / Set オブジェクトの操作

JavaScriptのデータ構造である「Map（キーと値のペア）」や「Set（重複のない値の集合）」を扱う際によく登場するメソッドです。

| メソッド     | 対象      | 説明                                                               |
| ------------ | --------- | ------------------------------------------------------------------ |
| **`.set()`** | Map       | 指定したキーで値を保存します。                                     |
| **`.get()`** | Map       | キーを指定して値を取り出します。                                   |
| **`.has()`** | Map / Set | 指定した要素（またはキー）が存在するかを `true/false` で返します。 |

### 1.1.3. 配列（Array）のメソッド

**`.every()`** に関しては、配列で非常によく使われるメソッドです。

- **`.every()`**: 配列の**すべての要素**が、指定した条件を満たしているかどうかをチェックします。

  - 例：`[2, 4, 6].every(n => n % 2 === 0)` → すべて偶数なので `true`。

## 1.2. Webpack

Webpackは、JavaScript、CSS、画像などの複数のフロントエンドファイルを依存関係に基づいて解析し、ブラウザで効率的に読み込める1つ（または少数）のファイルにまとめる（バンドルする）高機能なモジュールバンドラ

**Webpackの主な特徴とメリット:**

- **依存関係の解決:** JSファイル間のインポート・エクスポート関係を自動解析し、正しい順序で結合。
- **アセットのバンドル:** CSS、画像、フォントなどもJavaScriptとして扱い、1つのバンドルに集約。
- **ローダー（Loaders）:** TypeScriptやSass、画像などをWebpackが解釈可能な形式に変換。
- **プラグイン（Plugins）:** コードの圧縮（Minification）、最適化、ホットリローディングなど、ビルドプロセスを拡張。
- **開発効率化:** `webpack.config.js`による高度な設定が可能。

### 1.2.1. webpackのコア・コンセプト

#### 1.2.1.1. エントリー(Entry)

エントリーポイントはどのファイルを対象にwebpackの処理を走らせるのかを指定。
単一はもちろん複数のエントリーポイントを設定できる。

#### 1.2.1.2. 出力（Output）

バンドルしたファイルの出力先とファイル名を指定できる。

#### 1.2.1.3. ローダー

webpackはJavaScriptとJSONファイルしか理解できない。
他の種類のファイル（CSSファイル）を処理して変換することが可能。

#### 1.2.1.4. プラグイン（Plugins）

webpackにはいろんなプラグインがある
プラグインはページ上部でrequire()で呼び出して利用。
呼び出してplugins:[]の配列の中にnew()演算子でインスタンスを作成すると利用できる。

下記はwebpackが提供しているプラグインの一覧。
<https://webpack.js.org/plugins/>

#### 1.2.1.5. モード（Mode）

モードは「development」「production（default）」「none」。

## 1.3. Webpackの書き方

```bash
.
├── dist
│   ├── js
│   │   └── bundle.js
│   └── css
│       └── bundle.scss
├── node_modules
├── src
│   ├── js
│   │   └── index.js
│   └── css
│       └── index.scss
├── webpack
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
└── .eslintrc.js
└── .stylelintrc
└── .env
└── yarn.lock

```

### 1.3.1. 各webpackファイルの記述内容

```js
// ファイルやディレクトリのパスを操作することが多いと思うので、nodeのpathモジュールにアクセスできるようにしておく。
const path = require('path');

// 利用したいプラグインがある場合はファイル上部で読み込む。（下記は例）
const webpack = require('webpack');
const sass = require('sass');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: '',
  output: {
    path: '../dist/js/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // ここにloaderとかの設定を記述する
        ],
      },
      {
        test: /\.scss$/,
        use: [
          // ここにloaderとかの設定を記述する
        ],
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({resourceRegExp: /^\.\/locale$/}),
    new MiniCssExtractPlugin({
      filename: '../css/bundle.css',
    }),
    new CompressionPlugin(),
  ]
};

```

### 1.3.2. Hot Module Replacement (HMR)

- Hot Module Replacement (HMR)はwebpackの提供する仕組みで、画面の再描画すること無しにJSの変更をブラウザに適用してくれる開発ツール
- HMRは、Websocket通信と、ソースコードに注入されたいくつかのRuntimeと呼ばれるスクリプトによって実現される。
- ソースコードの変更をコンパイラが検知し、WebSocketでブラウザに通知、通知を受け取ったRuntimeはサーバーから変更分のスクリプトを取得してモジュールを置き換える

## 1.4. 参考

- [webpackはちゃんと理解しておいたほうがいい（導入時のTips付き） #webpack - Qiita](https://qiita.com/tanimoto-hikari/items/c718476294480330f929)
