## 1. dependency-injector

Python向けのDI（依存性注入）フレームワーク。[依存性の注入(DI)](../../設計/依存性の注入(DI).md)をコンテナ+プロバイダという形で構造化し、設定値の注入・ライフサイクル管理・テスト時のモック差し替えを容易にする。

```bash
pip install dependency-injector
```

## 2. 基本構成

- **Container**: 依存関係の定義をまとめる場所。`containers.DeclarativeContainer` を継承して宣言的に書く。
- **Provider**: オブジェクトの生成方法を定義するもの（`Factory`・`Singleton`・`Configuration` など）。

```python
from dependency_injector import containers, providers


class ApiClient:
    def __init__(self, api_key: str, timeout: int):
        self.api_key = api_key
        self.timeout = timeout


class Service:
    def __init__(self, api_client: ApiClient):
        self.api_client = api_client


class Container(containers.DeclarativeContainer):
    config = providers.Configuration()

    api_client = providers.Singleton(
        ApiClient,
        api_key=config.api_key,
        timeout=config.timeout,
    )

    service = providers.Factory(
        Service,
        api_client=api_client,
    )


if __name__ == "__main__":
    container = Container()
    container.config.api_key.from_env("API_KEY", "default-key")
    container.config.timeout.from_value(5)

    service = container.service()
```

## 3. Providerの種類

| Provider | 用途 |
| --- | --- |
| `Factory` | 呼ぶたびに新しいインスタンスを生成 |
| `Singleton` | 一度だけ生成し、以降は同じインスタンスを返す |
| `Configuration` | 設定値（env・yaml・dict など）を注入 |
| `Object` | 既存のオブジェクトをそのまま提供 |
| `List` / `Dict` | 複数のプロバイダをまとめる |
| `Selector` | 条件によって使うプロバイダを切り替える |
| `Resource` | 初期化・クリーンアップが必要なリソース（DB接続など）を管理 |

## 4. Configurationの読み込み方法

```python
container.config.from_yaml("config.yml")
container.config.from_env("API_KEY", "default")
container.config.from_dict({"timeout": 5})
```

## 5. Wiring（アプリケーションコードへの自動注入）

FastAPI・Flaskなどのエンドポイント関数に自動注入したい場合は `wiring` 機能を使う。`@inject` を付けた関数の引数に `Provide[Container.xxx]` をデフォルト値として指定すると、呼び出し時に自動でプロバイダから解決される。

```python
from dependency_injector.wiring import inject, Provide


@inject
def main(service: Service = Provide[Container.service]):
    print(service.api_client.timeout)


if __name__ == "__main__":
    container = Container()
    container.config.api_key.from_env("API_KEY")
    container.config.timeout.from_value(5)
    container.wire(modules=[__name__])

    main()  # service は自動で注入される
```

FastAPIと組み合わせる場合は `Depends(Provide[...])` の形にする。

```python
from fastapi import FastAPI, Depends
from dependency_injector.wiring import inject, Provide

app = FastAPI()


@app.get("/")
@inject
def index(service: Service = Depends(Provide[Container.service])):
    return {"timeout": service.api_client.timeout}
```

## 6. Resource Provider（初期化/後始末が必要なもの）

`yield` を使ったジェネレータ関数で、生成処理と後始末処理をひとつにまとめて定義できる。`container.init_resources()` / `container.shutdown_resources()` でライフサイクルを明示的に管理する。

```python
def init_db_connection(db_url: str):
    conn = create_connection(db_url)
    yield conn
    conn.close()


class Container(containers.DeclarativeContainer):
    config = providers.Configuration()
    db_connection = providers.Resource(
        init_db_connection,
        db_url=config.db_url,
    )
```

## 7. テストでのモック差し替え

`override()` で該当プロバイダの生成対象を差し替えられるため、依存を書き換えずにモックへ入れ替えられる。

```python
container.service.override(providers.Factory(MockService))
```

## 8. 大規模プロジェクトでの構成

コンテナを機能単位に分割し、`providers.Container` で入れ子にして組み合わせられる。依存グラフをコンテナ単位で見通しやすく保てる。

## 9. 関連

- [依存性の注入(DI)](../../設計/依存性の注入(DI).md)
- [Pydantic](Pydantic.md)
- [fastapi](fastapi.md)（組み込みDIの`Depends`との比較・併用方法）
