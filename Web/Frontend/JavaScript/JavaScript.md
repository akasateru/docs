
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

# 2. DOM（Document Object Model）

DOMは、ブラウザがHTML/XML文書を解析した結果できる**ツリー構造のオブジェクト表現**。JavaScriptはDOMを操作することで、ページの内容・構造・スタイルを動的に変更できる。「HTMLの見た目」と「JavaScriptが触れる中身」を繋ぐインターフェース。

## 2.1. ツリー構造

```html
<html>
  <body>
    <h1>タイトル</h1>
    <p>本文</p>
  </body>
</html>
```

```text
document
 └─ html
     └─ body
         ├─ h1 ── テキストノード「タイトル」
         └─ p  ── テキストノード「本文」
```

- **要素ノード（Element）**: `<h1>`や`<p>`などのタグ
- **テキストノード（Text）**: タグの中の文字列
- **属性（Attribute）**: `class`や`id`など（ノードではなく要素の一部として扱われる）

## 2.2. 主要なAPI

### 2.2.1. 要素を取得する

```js
document.getElementById("main");
document.querySelector(".title");
document.querySelectorAll("p");
```

### 2.2.2. 要素を作る・変更する

```js
const el = document.createElement("div");
el.textContent = "こんにちは";
el.classList.add("box");
```

### 2.2.3. ツリーに追加・削除する

```js
document.body.appendChild(el);
el.remove();
```

### 2.2.4. イベントを扱う

```js
el.addEventListener("click", () => {
  console.log("クリックされた");
});
```

## 2.3. 重要性・関連知識

- Reactなどのフレームワークも最終的にはDOMを操作している（仮想DOMは「実DOMへの書き込みを最小化する」ための仕組み）
- DOM操作は比較的コストが高い処理なので、頻繁な操作はパフォーマンスに影響する
- HTML/CSS/JSの学習において「静的なHTML」と「動くWebページ」を繋ぐ核心の概念

## 2.4. DOM読み込み・レンダリングの全体の流れ

ブラウザがHTMLを受け取ってから画面に表示するまでの処理は、大きく以下の順序で進む。

1. **HTMLパース → DOM構築**: HTMLを上から順に読み込み、DOMツリーを構築
2. **CSSOM構築**: CSSを解析し、CSSOMツリーを構築
3. **レンダーツリー構築**: DOM + CSSOMを組み合わせ、実際に表示される要素だけのツリーを作成（`display: none`の要素などは含まれない）
4. **レイアウト（リフロー）**: 各要素の位置・サイズを計算
5. **ペイント**: 実際にピクセルとして画面に描画

CSSはレンダリングをブロックする（CSSOMが完成するまでレンダーツリーを構築できないため）。そのため`<link>`は`<head>`内に置き、早期に読み込みを開始させるのが基本。

## 2.5. `<script>`タグの読み込み・実行タイミング

HTMLパーサーは`<script>`タグに到達すると、原則としてパースを一時停止してスクリプトを取得・実行する（**パーサーブロッキング**）。この挙動は属性によって変えられる。

| 指定             | 取得（ダウンロード） | 実行タイミング                             | 実行順序                 |
| ---------------- | --------------------- | -------------------------------------------- | ------------------------ |
| なし（通常）     | パースを止めて取得    | 取得完了後すぐ（パースを止めたまま）        | 記述順                   |
| `defer`          | パースと並行して取得  | **DOM構築完了後**（`DOMContentLoaded`直前）  | 記述順（複数あっても保証）|
| `async`          | パースと並行して取得  | **取得完了次第すぐ**（パースを中断してでも） | 取得完了順（不定）        |

- `defer`はDOM操作を伴うスクリプト（ほとんどのアプリコード）に適している
- `async`は他のスクリプトへの依存がない独立したスクリプト（広告・アクセス解析タグなど）に適している
- `<body>`末尾にscriptタグを置く昔ながらの手法は、`defer`と同様の効果（DOM構築後に実行）を狙ったもの

```html
<script src="a.js"></script>        <!-- パース停止して即実行 -->
<script src="b.js" defer></script>  <!-- DOM構築後、記述順に実行 -->
<script src="c.js" async></script>  <!-- 取得完了次第、即実行 -->
```

## 2.6. `DOMContentLoaded`と`load`イベント

| イベント            | 発火タイミング                                                         |
| -------------------- | ------------------------------------------------------------------------ |
| `DOMContentLoaded`   | DOMツリーの構築が完了した時点（画像やCSSなど外部リソースの読み込みは待たない） |
| `load`               | 画像・CSS・iframeなど、ページ内の全リソースの読み込みが完了した時点     |

```js
document.addEventListener("DOMContentLoaded", () => {
  // DOM操作を開始できるタイミング
});

window.addEventListener("load", () => {
  // 画像サイズを使った計算など、全リソース依存の処理はここ
});
```

- `defer`スクリプトの実行は`DOMContentLoaded`より前に完了する
- 一般的なDOM操作の開始は`DOMContentLoaded`を待てば十分で、`load`まで待つと画像等の読み込みが遅い場合に不必要に遅延する

# 3. JSエンジンの仕組み（V8など）

ソースコードのテキストを実行可能な形に変換し走らせるプログラム。V8（Chrome/Node.js）、SpiderMonkey（Firefox）、JavaScriptCore（Safari）など。

## 3.1. パース（構文解析）

- ソースコードをまず**トークン**に分解し（字句解析）、次に**AST（抽象構文木）**という木構造に組み立てる。この段階ではまだ実行されない。
- 例: `const x = 1 + 2;` → 「`const`宣言 → 変数`x` → 加算式 → `1`と`2`」という木構造になる。

## 3.2. 実行方式：インタプリタ → JITコンパイラ

- 昔のJSは「ASTを毎回読みながら実行する」純粋なインタプリタで低速だった。現代のエンジンは多段構成。

```
ソース → AST → バイトコード（インタプリタで即実行）
                    ↓ 何度も実行される「ホットな」関数を検知
                 JITコンパイラが型情報を推測して機械語に最適化コンパイル
```

- **インタプリタ（V8ではIgnition）**: まずバイトコードにしてすぐ実行開始。起動が速い。
- **JITコンパイラ（V8ではTurboFan）**: 同じ関数が繰り返し呼ばれる（ホットパス）と判断すると、型情報を前提に機械語へ最適化コンパイルし、以降はそちらを使う。
- 型の想定が外れる（例: 数値だけ来ると思ったら文字列が来た）と**Deopt（最適化解除）**して遅いパスに戻る。JSで型を安定させると速くなると言われる理由の一つ。

## 3.3. メモリ管理：コールスタックとヒープ

- **コールスタック**: 関数呼び出しを積み上げていく場所。同期処理はここで動く。積みすぎると`Stack overflow`。
- **ヒープ**: オブジェクトや配列などサイズが可変なデータを置く場所。

```js
function a() { b(); }
function b() { c(); }
function c() { console.log("here"); }
a();
```

呼び出すたびに`a → b → c`とスタックに積まれ、`c`が終わると順に降りていく。

## 3.4. シングルスレッドとイベントループ

- JSエンジン自体は基本的に**シングルスレッド**で、コールスタックは1本しかない。非同期処理（`setTimeout`、`fetch`、Promiseなど）はJSエンジンの外側にある**ランタイム環境（ブラウザやNode.js）**が担当する。

```
コールスタック（同期処理・1本）
     ↑ 空いたら取り出す
タスクキュー / マイクロタスクキュー（非同期処理の結果を待機）
     ↑ 非同期処理が完了したらここに積む
Web API / libuv など（setTimeout, I/O, ネットワークなど）
```

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// 出力: 1, 4, 3, 2
```

- `console.log("1")`と`"4"`は同期処理なのでコールスタックで即実行。
- `setTimeout`はWeb APIに処理を投げてタスクキューへ。
- `Promise.then`はマイクロタスクキューへ（**タスクキューより優先度が高い**）。
- コールスタックが空になったら、まずマイクロタスクキュー（`3`）→ その後タスクキュー（`2`）の順に処理される。これが**イベントループ**で、シングルスレッドなのに非同期に見える理由。

## 3.5. ガベージコレクション（GC）

- ヒープ上のオブジェクトのうち、どこからも参照されなくなったものを自動的に解放する。
- V8は主に「世代別GC」方式。「作られたばかりのオブジェクトはすぐ死ぬことが多い」という経験則を利用し、新しいオブジェクト用の領域（New Space）は頻繁に、古い領域（Old Space）はたまに掃除する戦略を取る。
