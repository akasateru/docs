# Alembic

SQLAlchemy用のPythonマイグレーションツール。[dbmate.md](dbmate.md)とよく比較される。

## 1. 概要

- SQLAlchemyのモデル定義と密結合したマイグレーションツール
- Pythonコード（`upgrade()`/`downgrade()`関数）でマイグレーションを記述する
- `alembic revision --autogenerate` で、SQLAlchemyのモデル定義との差分から変更内容を自動生成できる

## 2. 基本コマンド

- `alembic init alembic` — 初期化（設定ファイル・マイグレーションディレクトリを生成）
- `alembic revision --autogenerate -m "create users table"` — モデルとDBスキーマの差分からマイグレーションファイルを自動生成
- `alembic upgrade head` — 最新までマイグレーションを適用
- `alembic downgrade -1` — 1つ前のリビジョンに戻す
- `alembic current` — 現在適用済みのリビジョンを確認

## 3. マイグレーションファイルの例

```python
def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
    )

def downgrade():
    op.drop_table("users")
```

## 4. dbmateとの違い

| 観点 | Alembic | dbmate |
| --- | --- | --- |
| 対象言語 | Python（SQLAlchemy専用） | 言語非依存 |
| マイグレーション記述 | Pythonコード（`upgrade()`/`downgrade()`） | 生SQLファイル（`-- migrate:up`/`-- migrate:down`） |
| 自動生成（autogenerate） | あり（モデル定義との差分から生成） | なし（手動でSQLを書く） |
| ORMとの結合度 | 高い（SQLAlchemyのモデルと同期しやすい） | なし（ORMに依存しない） |
| 実行環境 | Pythonアプリ内で完結 | 単一バイナリ。CI/CDへの組み込みが容易で軽量 |

**使い分けの目安**:

- PythonでSQLAlchemyを使っているなら、モデルとマイグレーションを同期させやすいAlembicが自然な選択
- 言語非依存にしたい、生SQLで管理したい、シンプルさ・軽量さを重視するなら[dbmate.md](dbmate.md)
