# frameworks-now

主要な Web フレームワーク（Astro, React, Django, Rails など 90 以上）を毎日クロールし、最新バージョン・スター数・ダウンロード数・リリース履歴を静的サイトとして公開するツール。

---

## 要件

- GitHub Pages で公開
- 日次（JST 午前5時）で WEB 巡回して最新情報を取得
- 対象: 主要フレームワーク 90+（フロントエンド / フルスタック / バックエンド / SSG / モバイル / デスクトップ / スタイリング）
- 追跡メトリクス: 最新バージョン / リリース日 / GitHub スター数 / 週間ダウンロード数 / ライセンス / リリース履歴
- デザイン: Neo Brutalism 基調（変更なし）

---

## 技術スタック

| レイヤー       | 採用技術                              |
| -------------- | ------------------------------------- |
| 静的サイト生成 | Astro                                 |
| データ形式     | JSON（クローラー出力兼サイト入力）     |
| デザイン       | プレーンCSS（Neo Brutalism カスタム） |
| CI/CD          | GitHub Actions                        |
| ホスティング   | GitHub Pages                          |
| クローラー     | Node.js（フレームワーク定義駆動）     |

### Astro を選んだ理由
- コンテンツ駆動の静的サイト生成が得意（JSON を直接読める）
- `getStaticPaths` でフレームワークごとの詳細ページを簡単に生成できる
- バンドルサイズが小さく、Pages との相性が良い

### クローラーを Node.js に統一する理由
- サイト生成と同じ言語でメンテナンスしやすい
- レジストリ API（npm / PyPI / crates.io / Packagist）と GitHub API を素直に呼べる
- フレームワーク定義（config.js）を追加するだけで追跡対象を拡張できる

---

## アーキテクチャ

```
                  クロール (GitHub Actions cron)
                  ┌─────────────────────────┐
                  │  crawler/src/           │
                  │  ├── config.js          │  ← フレームワーク定義（94件）
                  │  ├── sources/           │
                  │  │   ├── github.js      │  ← repo情報 + Releases/Tags
                  │  │   ├── registry.js    │  ← npm / PyPI / crates / Packagist
                  │  │   └── downloads.js   │  ← 週間DL（npm / PyPI）
                  │  └── index.js           │  ← 並列実行・キャッシュフォールバック
                  └──────┬──────────────────┘
                         │ JSON出力
                         ▼
                  ┌─────────────────────────┐
                  │  data/                  │
                  │  ├── frameworks.json    │  ← 現在スナップショット
                  │  └── releases.json      │  ← リリース履歴
                  └──────┬──────────────────┘
                         │ Astroがビルド時に読み込み
                         ▼
                  ┌─────────────────────────┐
                  │  site/ (Astro)          │
                  │  src/pages/index.astro  │  ← 一覧（フィルタ/ソート）
                  │  src/pages/frameworks/  │  ← 詳細ページ [id]
                  │  src/components/        │
                  │  src/lib/data.js        │
                  └──────┬──────────────────┘
                         │ astro build → dist/
                         ▼
                  ┌─────────────────────────┐
                  │  GitHub Pages 公開       │
                  └─────────────────────────┘
```

---

## データモデル

### data/frameworks.json（現在スナップショット）

```json
{
  "id": "astro",
  "name": "Astro",
  "description": "The web framework for content-driven websites",
  "category": "fullstack",
  "language": "TypeScript",
  "repo": "withastro/astro",
  "homepage": "https://astro.build",
  "package": { "manager": "npm", "name": "astro" },
  "version": "5.18.2",
  "releaseDate": "2026-07-15",
  "stars": 51200,
  "forks": 3900,
  "openIssues": 800,
  "weeklyDownloads": 350000,
  "totalDownloads": 120000000,
  "license": "MIT",
  "lastCommit": "2026-07-30",
  "updatedAt": "2026-07-31T01:06:50Z"
}
```

### data/releases.json（リリース履歴）

```json
[
  {
    "id": "astro",
    "releases": [
      { "version": "5.18.2", "date": "2026-07-15" },
      { "version": "5.18.1", "date": "2026-07-08" }
    ]
  }
]
```

### package 管理タイプ

| manager | 意味                          | バージョン取得元 |
| ------- | ----------------------------- | ---------------- |
| `npm`   | npm パッケージ                | npm registry     |
| `pypi`  | PyPI パッケージ               | PyPI JSON API    |
| `crates`| crates.io クレート            | crates.io API    |
| `gem`   | RubyGems パッケージ           | RubyGems API     |
| `packagist` | Packagist パッケージ      | Packagist p2 API |
| 無し    | レジストリ無し（GitHubのみ）  | GitHub Releases / Tags |

---

## データソース

| 情報             | 取得元                                                       |
| ---------------- | ------------------------------------------------------------ |
| バージョン+履歴  | npm `registry.npmjs.org/<pkg>` / PyPI `pypi.org/pypi/<pkg>/json` / crates.io `api/v1/crates/<name>` / Packagist `repo.packagist.org/p2/<v>/<p>.json` / RubyGems `api.rubygems.org/api/v1/gems/<name>.json` |
| バージョン       | GitHub Releases API → Tags API（レジストリを持たないもの）  |
| スター/フォーク/issue/license/最終コミット | GitHub `repos/<owner>/<name>` |
| 週間DL           | npm `api.npmjs.org/downloads/point/last-week/<pkg>` / PyPI `pypistats.org/api/packages/<pkg>/recent` / crates.io `downloads` |
| ライセンス       | GitHub API またはレジストリの `license` フィールド           |

### GitHub API レート制限対策

- CI では `GITHUB_TOKEN`（1000回/h）を使用
- ローカルでは認証済み `gh` CLI → 未認証リクエストの順にフォールバック
- 取得失敗時は前回データ（`data/frameworks.json`）をキャッシュとして保持し、値の欠落を防止

---

## ディレクトリ構成

```
frameworks-now/
├── site/                    # Astro プロジェクト
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro          # 一覧ページ（フィルタ/ソート）
│   │   │   ├── frameworks/[id].astro# フレームワーク詳細ページ
│   │   │   └── 404.astro
│   │   ├── components/
│   │   │   ├── FrameworkCard.astro  # 一覧カード
│   │   │   ├── StatsBar.astro       # 統計カード群
│   │   │   └── ReleaseTable.astro   # リリース履歴表
│   │   ├── layouts/
│   │   │   └── Layout.astro
│   │   └── lib/
│   │       └── data.js              # data/*.json 読み込み
│   ├── public/
│   │   └── favicon.svg
│   ├── astro.config.mjs
│   └── package.json
├── crawler/                 # クローラー
│   ├── src/
│   │   ├── config.js        # フレームワーク定義
│   │   ├── sources/
│   │   │   ├── github.js
│   │   │   ├── registry.js
│   │   │   └── downloads.js
│   │   └── index.js         # エントリーポイント
│   └── package.json
├── data/                    # クロール結果のJSON（Git管理）
│   ├── frameworks.json
│   └── releases.json
├── .github/workflows/
│   └── crawl-and-deploy.yml
├── PLAN.md
└── DEV-MEMO.md
```

---

## カテゴリ定義

| id          | 表示名         | 例 |
| ----------- | -------------- | --- |
| `frontend`  | Frontend       | React, Vue, Svelte, Angular, Solid, Qwik |
| `fullstack` | Full-stack     | Next.js, Nuxt, SvelteKit, Remix, Astro, Django, Rails, Laravel |
| `backend`   | Backend        | Express, Fastify, FastAPI, Spring Boot, Gin, Axum, ASP.NET Core |
| `static-site` | Static Site  | Docusaurus, VitePress, Eleventy, Hugo, Jekyll |
| `mobile`    | Mobile         | React Native, Flutter, Ionic, Expo |
| `desktop`   | Desktop        | Electron, Tauri, Wails, .NET MAUI |
| `styling`   | Styling        | Tailwind CSS, Bootstrap, Material UI, shadcn/ui |

---

## デザイン（Neo Brutalism）※維持

### 基本ルール
- 太い黒枠: `border: 3px solid #000`
- 背景: 白＋単色ブロック（#fff, #f5f5f5）
- アクセントカラー: 蛍光イエロー `#FFE600`, ピンク `#FF69B4`, シアン `#00E5FF`
- フォント: ゴシック系（`system-ui`, `Inter`）太字多用
- シャドウやグラデーションは使わない（hover時のみ `box-shadow` で浮かせる）
- カードはフラット、角丸は小さく（`border-radius: 4px`）

### UI構造
- **一覧ページ**: 統計ヘッダー → フィルタチップ（カテゴリ/言語） → ソート切替 → フレームワークカードグリッド
- **詳細ページ**: ヒーロー（名前・バージョン・説明・リンク） → 統計カード（星/フォーク/週間DL/issue） → リリース履歴表
- フィルタ・ソートはクエリパラメータ（`?category=` / `?sort=`）で実現し、JavaScript 不使用を維持

---

## CI/CD（GitHub Actions）

### スケジュール
- cron: `0 20 * * *`（UTC 20:00 = JST 5:00 冬時間）
- `workflow_dispatch` で手動トリガー可能

### ワークフロー
1. `schedule` または `workflow_dispatch` で起動
2. `npm ci` → `node src/index.js` 実行 → `data/*.json` を更新
3. `git commit & push`（更新があった場合のみ）
4. `astro build` 実行 → `dist/` 生成
5. `actions/upload-pages-artifact` + `actions/deploy-pages` でデプロイ

### Actions バージョン

| アクション                    | 採用バージョン |
| ----------------------------- | -------------- |
| `actions/checkout`            | v7             |
| `actions/setup-node`          | v7             |
| `actions/configure-pages`     | v6             |
| `actions/upload-pages-artifact` | v5           |
| `actions/deploy-pages`        | v5             |

---

## マイルストーン

| Phase | 内容 |
| ----- | ---- |
| 0     | リニューアルプラン確定 + `.md` 全面改訂 |
| 1     | フレームワーク定義リスト作成（94件）+ データソース検証 |
| 2     | クローラー実装（GitHub + 各レジストリ + 週間DL） |
| 3     | `data/frameworks.json` / `releases.json` 生成 |
| 4     | Astro サイト実装（一覧 + 詳細ページ、Neo Brutalism 維持） |
| 5     | CI 更新 + GitHub Pages デプロイ確認 |

---

## 注意事項

- 各 API への負荷を考慮し、並列実行数を制限しリクエスト頻度を抑える
- 取得失敗時は前回データへフォールバックし、サイトが欠損表示にならないようにする
- GitHub Pages のビルド制限（10分 / 月1000回）に収まるサイズに抑える
