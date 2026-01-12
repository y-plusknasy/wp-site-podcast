# WPSite Podcast - 開発環境ドキュメント

## 1. 開発環境の概要

本プロジェクトでは、開発者間の環境差異を排除し、スムーズなセットアップを実現するために、**Docker** および **VS Code Dev Containers** を採用しています。

開発に必要な全てのツール（PHP, MariaDB, WP-CLI, Firebase CLI, Node.js）はコンテナ内に封入されています。

## 2. 前提条件

*   Docker Desktop (または Docker Engine)
*   Visual Studio Code
*   VS Code Extension: [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## 3. 環境セットアップ手順

1.  **リポジトリのクローン**:
    ```bash
    git clone https://github.com/y-plusknasy/wp-site-podcast.git
    cd wp-site-podcast
    ```
2.  **VS Code で開く**:
    ```bash
    code .
    ```
3.  **コンテナの起動**:
    *   VS Code が `.devcontainer` フォルダを検出し、右下に通知が表示されるので「Reopen in Container」をクリックします。
    *   または、コマンドパレット (`Cmd+Shift+P` / `Ctrl+Shift+P`) から `Dev Containers: Reopen in Container` を実行します。
    *   初回ビルドには数分かかる場合があります。

4.  **動作確認**:
    *   コンテナ起動後、ブラウザで [http://localhost:8081](http://localhost:8081) にアクセスし、WordPress サイトが表示されることを確認します。

## 4. コンテナ構成詳細

`compose.yml` および `.devcontainer/` に基づく構成は以下の通りです。

### 4.1 サービス定義
*   **wordpress**:
    *   ベースイメージ: `wordpress:php8.3-apache` (プロジェクト用にカスタムビルド)
    *   ポート: `8081` (ホスト) -> `80` (コンテナ)
    *   マウント:
        *   `./html`: `/var/www/html` (WordPress本体)
        *   `.`: `/workspace` (プロジェクトルート。Firebase設定などの編集用)
    *   同梱ツール: WP-CLI, Firebase CLI, Node.js (LTS), Git
*   **db**:
    *   イメージ: `mariadb:10.5`
    *   ポート: `3306`
    *   データ永続化: Docker Volume `db_data`

### 4.2 環境変数 (.env)
DB接続情報などの機密情報は `.env` ファイルで管理され、`compose.yml` 経由でコンテナに注入されます。また、`wp-config.php` はこれらの環境変数を優先的に読み込むように修正されています。

```ini
# .env example
DB_ROOT_PASSWORD=root_password
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=password
```

### 4.3 ローカル環境特有の設定

本開発環境では、スムーズな操作とセキュリティ確保のために以下の調整が行われています。

*   **WP-CLI 設定 (`wp-cli.yml`)**:
    *   `path: /var/www/html` を指定しているため、`/workspace` ディレクトリから直接 `wp` コマンドを実行可能です。
    *   開発データベースへの接続時にSSLエラーが発生しないよう、`skip-ssl: true` が自動的に適用されます。
*   **URL 固定 (`wp-config-docker.php`)**:
    *   本番データベースをインポートしてもローカル環境で動作するよう、`WP_HOME` および `WP_SITEURL` を `http://localhost:8081` に強制設定しています。
*   **Git 除外設定 (`.gitignore`)**:
    *   `html/wp-config.php`, `.env`, `local_backup.sql`, `html/wp-content/uploads/` などの秘匿情報やバイナリデータは Git 管理対象外となっています。

## 5. 主な操作コマンド (Tips)

すべての操作は、VS Code の統合ターミナル（コンテナ内部）から実行します。

### WordPress 関連 (WP-CLI)
```bash
# データベース接続確認
wp db check

# データベースのエクスポート
wp db export local_backup.sql

# データベースのインポート
wp db import local_backup.sql

# ユーザー一覧
wp user list
```

### Firebase 関連
```bash
# ログイン (初回のみ)
firebase login --no-localhost

# デプロイ (Storage ルールなど)
firebase deploy
```

## 6. ディレクトリ構造の補足
*   `/workspace`: コンテナ内のワークスペースルート。ホストのプロジェクトルートと同期しています。
*   `/var/www/html`: WordPress のドキュメントルート。ホストの `html/` ディレクトリと同期しています。

---
**Last Updated**: 2026-01-12
