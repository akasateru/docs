# RSS

RSS（Really Simple Syndication）は、Webサイトの更新情報を配信するためのXMLベースのフォーマット。サイト側が新着記事の一覧を機械可読な形で公開し、読者やツールが定期的に取得（RSS取得）して新着を検知できるようにする仕組み。

## 1. 概要

- サイトが `/feed`、`/rss.xml`、`/atom.xml` のようなURL（フィードURL）でXMLを公開する
- そのURLに定期的にHTTPリクエストを送り、XMLをパースして記事一覧を構造化データとして取り出すことを「RSS取得」と呼ぶ
- 目的は「毎回サイトを人間が見に行かなくても新着を自動検知できる」こと

## 2. フォーマットの中身

記事（`<item>`）ごとに以下のような情報を持つ。

- タイトル
- リンク（記事URL）
- 概要・本文の一部
- 投稿日時
- 著者 など

```xml
<rss version="2.0">
  <channel>
    <title>あるブログ</title>
    <item>
      <title>新しい記事のタイトル</title>
      <link>https://example.com/posts/123</link>
      <pubDate>Wed, 05 Aug 2026 09:00:00 +0900</pubDate>
      <description>記事の概要...</description>
    </item>
  </channel>
</rss>
```

RSSはXMLの構文規則（[XML](XML.md)参照）を満たす文書の一種。

## 3. 関連フォーマット・用語

- **Atom**: RSSと同じ目的の別フォーマット。XMLのタグ構造がRSSと異なる
- **フィードURL**: フィードのXMLが置かれているURL
- **RSSリーダー**: フィードを購読して新着をまとめて表示するアプリ（Feedly など）

## 4. 用途

- ニュースサイトやブログの新着記事の自動収集
- 複数サイトの更新をまとめて監視する
- 収集した記事を要約・通知・保存するパイプラインの入力データにする

多くのサービス（Qiita、GitHub、YouTubeなど）がRSSフィードを提供しており、自動収集・通知の仕組みづくりでよく使われる。

## 5. 参考

- [XML](XML.md) — RSSが準拠する構文規則
