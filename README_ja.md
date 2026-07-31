# frameworks-now

主要な Web フレームワークを横断的に追跡するサイトです。最新バージョン・GitHub スター数・ダウンロード数・リリース履歴を毎日自動クロールし、静的サイトとして公開しています。

公開サイト: <https://watanabe3tipapa.github.io/frameworks-now/>

## 特徴

- **毎日自動クロール** — GitHub Actions が JST 午前5時にフレームワーク情報を自動更新
- **90以上のフレームワーク・7カテゴリ** — フロントエンド / フルスタック / バックエンド / SSG / モバイル / デスクトップ / スタイリング
- **言語横断カバレッジ** — TypeScript, JavaScript, Python, Ruby, PHP, Java, Go, Rust, C#, Dart
- **バージョン・人気度の追跡** — 最新バージョン、リリース日、GitHub スター数、週間ダウンロード数、ライセンス
- **リリース履歴** — フレームワークごとの詳細ページにバージョン履歴表を表示
- **Neo Brutalism デザイン** — フラットカード・太い黒枠・ネオンアクセント（JavaScript 不使用）

## カテゴリ一覧

| カテゴリ | 例 |
| -------- | --- |
| フロントエンド | React, Vue, Svelte, Angular, Solid, Qwik, Preact, Lit |
| フルスタック | Next.js, Nuxt, SvelteKit, Remix, Astro, Django, Rails, Laravel |
| バックエンド | Express, Fastify, FastAPI, Spring Boot, Gin, Axum, ASP.NET Core |
| 静的サイト | Docusaurus, VitePress, Eleventy, Hugo, Jekyll |
| モバイル | React Native, Flutter, Ionic, Expo |
| デスクトップ | Electron, Tauri, Wails, .NET MAUI |
| スタイリング | Tailwind CSS, Bootstrap, Material UI, shadcn/ui |

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/watanabe3tipapa/frameworks-now.git

# クローラーの依存関係をインストール
cd crawler
npm install

# サイトの依存関係をインストール
cd ../site
npm install
```

## 使い方

リポジトリルートから実行します:

```bash
# フルパイプライン（クロール + ビルド）
npm run run

# クロールのみ
npm run crawl

# サイトのビルドのみ
npm run build
```

> クローラーは GitHub API を利用します。レート制限を避けるため `GITHUB_TOKEN` 環境変数を
> 推奨します。未設定の場合は認証済み `gh` CLI、さらに未認証リクエストの順でフォールバックします。

## データソース

| データ | 取得元 |
| ------ | ------ |
| バージョン・リリース履歴 | npm registry / PyPI / crates.io / Packagist / GitHub Releases |
| スター数・フォーク・issue・ライセンス | GitHub API（`repos/<owner>/<name>`） |
| 週間ダウンロード数 | npm downloads API / PyPI Stats / crates.io |

クロール結果は2ファイルに保存されます:

- `data/frameworks.json` — 全フレームワークの現在スナップショット
- `data/releases.json` — 全フレームワークのリリース履歴

## コントリビューション

`crawler/src/config.js` にフレームワークを追加・更新できます。

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチをプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## ライセンス

未定。

## 連絡先

GitHub: [https://github.com/watanabe3tipapa/frameworks-now](https://github.com/watanabe3tipapa/frameworks-now)
