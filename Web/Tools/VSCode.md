## 1. 拡張機能

### 1.1. arkdown All in One

1. 機能

- 太字にするショートカット
- リスト入力の補完
- テキスト選択状態でURLをコピペしてリンク表記に変換

### 1.2. Paste Image

- 画像を簡単に挿入できるようになる拡張機能

### 1.3. :emojisense:

- 絵文字が挿入できる拡張機能

### 1.4. スニペット登録

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

## 2. 参考

- [Markdown（マークダウン）をVSCodeの拡張機能とスニペットで効率良く書く](https://qiita.com/waicode/items/1310d3f0aeb24f393b88)
