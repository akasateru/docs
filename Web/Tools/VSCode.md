## 1. 標準機能

### 1.1. Show Call Hierarchy

- 呼び出し元、呼び出し先の関数を参照できる機能
- [【VSCode】Call Hierarchyを表示する方法 #VSCode - Qiita](https://qiita.com/P-man_Brown/items/4ea30b5d014a0fdd4d00)

## 2. 拡張機能

### 2.1. arkdown All in One

1. 機能

- 太字にするショートカット
- リスト入力の補完
- テキスト選択状態でURLをコピペしてリンク表記に変換

### 2.2. Paste Image

- 画像を簡単に挿入できるようになる拡張機能

### 2.3. :emojisense:

- 絵文字が挿入できる拡張機能

### 2.4. スニペット登録

- 拡張機能が無い場合スニペット登録ができる
- `.vscode/markdown.code-snippets`にスニペットを登録

```json
{
  "table": {
    "prefix": "table",
    "body": [
      "| header1 | header2 | header3 |",
      "| ------- | ------- | ------- |",
      "|         |         |         |",
      "|         |         |         |"
    ],
    "description": "テーブル（Markdown形式）"
  }
}
```

### 2.5. Remote - WSL

## 3. ショートカット

`Ctrl + Shift + D`: デバッグ
`Ctrl + Shift + E`: エクスプローラー
`Ctrl + Shift + F`: 検索
`Ctrl + Shift + G G`: ソース管理

## 4. VSCodeで保存する時.mdファイルに段落番号をつける方法

### 4.1. メモ

- `.vscode/settings.json` に下記を記述
- 必須拡張機能
  - **Markdown All in One**（`yzhang.markdown-all-in-one`）… 見出しに段落番号を付けるコマンドを提供
  - **Run on Save**（`pucelle.run-on-save`）… 保存時に **VSCode のコマンド** を実行できる（emeraldwalk.RunOnSave はシェル用のため不可）

#### 4.1.1. 設定の要点

- `runOnSave.commands` で、`.md` 保存時に `markdown.extension.toc.addSecNumbers` を実行（IDは addSectionNumbers ではない）
- **`runIn: "vscode"`** にすると拡張機能のコマンドを実行できる（省略時はシェルコマンド扱い）
- `markdown.extension.toc.updateOnSave` で目次（TOC）も保存時に更新可能

## 5. 参考

- [Markdown（マークダウン）をVSCodeの拡張機能とスニペットで効率良く書く](https://qiita.com/waicode/items/1310d3f0aeb24f393b88)
- [VSCode(VisualStudioCode)の定番機能を一挙解説 #新人プログラマ応援 - Qiita](https://qiita.com/midiambear/items/bc0e137ed77153cb421c#vscode%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%99%E3%82%8B)
