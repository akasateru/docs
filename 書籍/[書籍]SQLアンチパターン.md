# [書籍]SQLアンチパターン

Bill Karwin著。SQL設計・実装でありがちな失敗パターンとその対策をまとめた書籍の読書メモ。

## 1. IDリクワイアード

どのテーブルにも機械的に`id`という**疑似キー（代理キー）**を主キーとして追加する習慣そのものがアンチパターン。とくに**交差テーブル（中間テーブル）**での適用が問題になる。

### 1.1. 何が問題か

「バグ」と「製品」の多対多関係を表す`BugsProducts`テーブルを例にする。

```sql
-- アンチパターン
CREATE TABLE BugsProducts (
  id SERIAL PRIMARY KEY,
  bug_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL
);

INSERT INTO BugsProducts (bug_id, product_id) VALUES (1234, 1);
INSERT INTO BugsProducts (bug_id, product_id) VALUES (1234, 1); -- 重複してもエラーにならない
```

本来一意であるべきなのは`(bug_id, product_id)`の組み合わせだが、意味を持たない`id`が主キーになっているせいで、同じ紐付けを何度でも重複挿入できてしまう。「あるバグとある製品の関連は1つだけ」という業務ルールをDB側で保証できなくなる。

もう一つの問題は曖昧さ。`id`という名前はどのテーブルでも同じなので、複数テーブルをJOINした結果に`id`が並ぶと、どのテーブル由来かがカラム名だけでは分からなくなる。

### 1.2. 対策

交差テーブルには疑似キーの`id`を追加せず、外部キーの組み合わせをそのまま**複合主キー**にする。

```sql
-- 対策: 複合主キー
CREATE TABLE BugsProducts (
  bug_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (bug_id, product_id)
);
-- 重複挿入は主キー制約違反でエラーになる
```

あわせて、主キーには単に`id`ではなく`bug_id`のようにテーブル名を反映した名前を付けると、JOIN結果でも出自が分かりやすくなる。疑似キー自体が悪いのではなく、「どのテーブルにも思考停止で`id`を付ける」「複合キーで十分な場面でも疑似キーに頼る」ことが問題という主旨の章。

外部キー名をテーブルごとに意味のある名前で揃えておくと、[JOIN句のUSING構文](../Web/Database/Database.md)がそのまま使えて結合が書きやすくなるという副次的なメリットもある。

キーの種類全般（候補キー・自然キー・ユニークキーなど）は[Database.md §10](../Web/Database/Database.md)を参照。
