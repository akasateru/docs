# Rails基礎

Ruby on RailsにおけるMVC（Model-View-Controller）アーキテクチャの基礎。

## 1. MVCの3層

- **Model（モデル）**: データベースとのやり取りを担当。ビジネスロジック（データの検証、処理など）を含む。Railsでは `app/models/` に配置
- **View（ビュー）**: ユーザーに表示する画面（HTML）を生成。データの表示だけに専念し、ロジックは最小限に留める。Railsでは `app/views/` に配置（ERB, Hamlなど）
- **Controller（コントローラー）**: ModelとViewの橋渡し役。ユーザーのリクエストを受け取り、Modelからデータを取得してViewに渡す。Railsでは `app/controllers/` に配置

### 1.1. リクエストの流れ

```text
GET /posts/1
  ↓
routes.rb（ルーティング）
  ↓
PostsController#show（アクション）
  ↓
Post.find(1)（Modelでデータ取得）
  ↓
@post をインスタンス変数でViewに渡す
  ↓
show.html.erb（Viewで HTML 表示）
```

### 1.2. メリット

- **責任分離**: 各層の役割が明確
- **テストしやすい**: 各層を独立してテスト可能
- **保守性**: コード変更の影響範囲が限定される
- **再利用性**: 同じModelを複数のView/Controllerで使える

Railsはこの MVC パターンを強く推奨する「Convention over Configuration」の設計思想を持つ。

## 2. 実装例（ブログの記事一覧・詳細・作成）

### 2.1. Model（`app/models/post.rb`）

```ruby
class Post < ApplicationRecord
  validates :title, presence: true
  validates :content, presence: true

  def summary
    content.truncate(100)
  end
end
```

### 2.2. Controller（`app/controllers/posts_controller.rb`）

```ruby
class PostsController < ApplicationController
  def index
    @posts = Post.all
  end

  def show
    @post = Post.find(params[:id])
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)
    if @post.save
      redirect_to @post, notice: '記事が作成されました'
    else
      render :new
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :content)
  end
end
```

### 2.3. View（`app/views/posts/`）

一覧（`index.html.erb`）:

```erb
<h1>記事一覧</h1>
<%= link_to '新規作成', new_post_path, class: 'btn btn-primary' %>

<table>
  <tbody>
    <% @posts.each do |post| %>
      <tr>
        <td><%= post.title %></td>
        <td><%= post.summary %></td>
        <td>
          <%= link_to '詳細', post_path(post) %>
          <%= link_to '削除', post_path(post), method: :delete %>
        </td>
      </tr>
    <% end %>
  </tbody>
</table>
```

### 2.4. ルーティング（`config/routes.rb`）

```ruby
Rails.application.routes.draw do
  resources :posts
end
```

自動生成されるルート:

- `GET  /posts` → `index`
- `GET  /posts/new` → `new`
- `POST /posts` → `create`
- `GET  /posts/:id` → `show`

実際にプロジェクトで試すなら `rails g scaffold Post title:string content:text` で一式を自動生成できる。
