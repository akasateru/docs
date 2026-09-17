# 1. OAuth 2.0 と OIDC

Webアプリのログイン・API認証で使われる各種サービス（Auth0, Okta, Cognito, Firebase Auth等）やPythonライブラリ（Authlib, python-jose, PyJWT等）は、実装形態が違うだけで根底の仕組みはほぼ共通の標準規格に乗っている。

## 1.1. 2つの標準規格

- **OAuth 2.0**: 「認可（Authorization）」の標準。「このアプリに、ユーザーの代わりにこのAPIを叩く権限を与える」ための仕組み。
- **OIDC（OpenID Connect）**: OAuth 2.0の上に乗る拡張で、「認証（Authentication）」＝「ユーザーが誰であるか」を証明するための標準。一般的な「ログイン機能」はほぼこれ。

Auth0・Okta・Firebase Auth・Google/GitHubログインなど、いわゆる「ログイン基盤」はすべてこの2規格に準拠している。[Auth0](Auth0.md)もその1実装。

## 1.2. 登場人物の役割分担

| 役割 | 例 | 担当すること |
| --- | --- | --- |
| IdP / IDaaS | Auth0, Okta, Cognito | ユーザーのログイン処理を実際に行い、トークンを発行するサーバー側 |
| クライアントライブラリ | Authlib, python-jose, PyJWT, requests-oauthlib | アプリからIdPとやり取りしたり、発行されたトークンを検証したりする道具 |
| フレームワーク統合 | Flask-Login, django-allauth, FastAPI Users | クライアントライブラリをさらにラップしてWebフレームワークに組み込みやすくしたもの |

IdPとクライアントライブラリは対立するものではなく組み合わせて使う（例: Auth0にログイン処理を任せ、Authlibでトークンのやり取り・検証を行う）。

## 1.3. トークンの形式

発行されるトークンは大体 **JWT（JSON Web Token）** という形式で、`PyJWT` や `python-jose` はこのJWTの発行・検証（署名チェック）を行う汎用ライブラリ。IdPが変わってもJWTの検証ロジックはほぼ同じコードになる。

## 1.4. 実装例: Webアプリ側（ログインをIdPに任せる）

認可コードフロー（Authorization Code Flow）の実装。Flask + Authlibの例。

```python
from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, url_for, session, jsonify

app = Flask(__name__)
app.secret_key = "..."

oauth = OAuth(app)
auth0 = oauth.register(
    "auth0",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    server_metadata_url="https://YOUR_DOMAIN/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)

@app.route("/login")
def login():
    return auth0.authorize_redirect(redirect_uri=url_for("callback", _external=True))

@app.route("/callback")
def callback():
    token = auth0.authorize_access_token()
    session["user"] = token["userinfo"]
    return redirect("/")
```

流れ: `/login` → IdPのログイン画面にリダイレクト → ユーザーがログイン → IdPが `code` 付きで `/callback` に戻す → `authorize_access_token()` がその `code` を裏でトークンと交換する。`server_metadata_url` はOIDCの「発見エンドポイント」で、IdP側の各種URLをここから自動取得する。

## 1.5. 実装例: API側（発行されたトークンを検証する）

IdPにアクセスせず、公開鍵（JWKS）だけでJWTの署名を検証するパターン。FastAPI + `python-jose` の例。

```python
import requests
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

AUTH0_DOMAIN = "your-tenant.us.auth0.com"
API_AUDIENCE = "https://your-api-identifier"

app = FastAPI()
security = HTTPBearer()
jwks = requests.get(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json").json()

def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    kid = jwt.get_unverified_header(token)["kid"]
    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if key is None:
        raise HTTPException(401, "Invalid token header")
    try:
        return jwt.decode(token, key, algorithms=["RS256"],
                           audience=API_AUDIENCE, issuer=f"https://{AUTH0_DOMAIN}/")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/protected")
def protected(payload=Depends(verify_token)):
    return {"user": payload["sub"]}
```

流れ: トークンのヘッダにある `kid`（鍵ID）で、IdPが公開しているJWKS（公開鍵一覧）から対応する鍵を探し、署名を検証する。`audience`/`issuer` も照合してトークンの使い回しを防ぐ。

「JWKSを取得 → kidで鍵特定 → 署名検証 → aud/iss確認」というこのパターンは、Auth0でもOkta・Cognito・Google・Firebase Authでもほぼ同じコードになる（ドメインとエンドポイントが変わるだけ）。OIDC/JWTという共通規格に乗っているため、この共通化が効く。

実運用ではJWKSを毎リクエスト取得せず、TTL付きでキャッシュするのが定石（`functools.lru_cache` や `cachetools` 等）。

## 1.6. 参考

- [Auth0](Auth0.md)
- [認証認可](認証認可.md)
