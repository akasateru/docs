### 1. StreamingResponse

FastAPIにおいて、レスポンスデータを一度にメモリに読み込むのではなく、ジェネレータなどを使ってチャンクごとに段階的にクライアントへ送信する仕組み

### 2. Depends（依存性注入）

FastAPI組み込みの[DI](../../設計/依存性の注入(DI).md)機構。関数・クラスをリクエストごとに呼び出し、その戻り値をハンドラの引数に注入する。

#### 2.1. 基本形

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db  # yieldするとcontext manager的に動く（リクエスト終了後に再開してクリーンアップ）
    finally:
        db.close()

@app.get("/users/{id}")
def get_user(id: int, db: Session = Depends(get_db)):
    return db.query(User).get(id)
```

- `return`のみの関数は単発の値を返すだけ。
- `yield`を使うと「セットアップ → リクエスト処理 → ティアダウン」の流れになり、DBセッションのクローズなど後始末が必要な依存に向く。

#### 2.2. 依存のネスト

`Depends`は依存が依存を呼べるため、FastAPIが依存グラフを自動解決する（手動配線は不要）。

```python
def get_settings() -> Settings:
    return Settings()

def get_db(settings: Settings = Depends(get_settings)):
    return connect(settings.db_url)

def get_repo(db=Depends(get_db)):
    return UserRepository(db)

@app.get("/users/{id}")
def get_user(id: int, repo: UserRepository = Depends(get_repo)):
    return repo.find(id)
```

#### 2.3. クラスベースの依存

クラスをそのまま`Depends`に渡すと、`__init__`の引数がクエリパラメータとして解釈される。

```python
class Pagination:
    def __init__(self, skip: int = 0, limit: int = 100):
        self.skip = skip
        self.limit = limit

@app.get("/items")
def list_items(pagination: Pagination = Depends(Pagination)):
    ...
```

#### 2.4. キャッシュ挙動

デフォルト（`use_cache=True`）では同一リクエスト内で同じ依存関数は1回しか呼ばれず、結果が使い回される。複数箇所で`Depends(get_db)`を指定しても同じセッションになる。明示的に無効化する場合は`Depends(get_db, use_cache=False)`。

#### 2.5. テスト時の差し替え

`app.dependency_overrides`に本物の依存関数をキーとしてモックを登録すると、テスト実行時だけ差し替えられる。

```python
def override_get_db():
    return fake_session

app.dependency_overrides[get_db] = override_get_db
```

#### 2.6. dependency-injectorとの併用

コンテナ管理を[dependency-injector](dependency-injector.md)に任せる場合は、`Provide[...]`を`Depends()`でラップする。

```python
@app.post("/orders")
@inject
def create_order(service: OrderService = Depends(Provide[Container.order_service])):
    service.place_order("Widget")
```

#### 2.7. 使い分けの目安

FastAPIのみで完結するAPIなら`Depends`単体で十分なことが多い。CLI/バッチ処理など複数エントリポイントにまたがる場合や、Singleton/Configurationなどのライフサイクル管理が必要な場合は[dependency-injector](dependency-injector.md)のコンテナで一元管理する方が見通しが良い。
