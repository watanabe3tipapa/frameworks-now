# DEV-MEMO — 実装履歴

## 大改造: standard-libraries-now → frameworks-now

標準ライブラリ追跡サイトから、**Web フレームワーク追跡サイト**へ全面リニューアル。

- 追跡対象を 5 言語の標準ライブラリ（670 modules）→ 主要フレームワーク 94 件へ変更
- 追跡メトリクス: 最新バージョン / リリース日 / GitHub スター数 / 週間ダウンロード数 / ライセンス / リリース履歴
- カテゴリ: frontend / fullstack / backend / static-site / mobile / desktop / styling
- サイト構成: 一覧ページ + フレームワーク別詳細ページ（`/frameworks/[id]/`）
- デザイン: Neo Brutalism 維持
- パイプライン: `crawler → data/*.json → Astro → GitHub Pages` を踏襲

## Phase 1: `.md` 全面改訂 ✅

- README.md / README_ja.md / PLAN.md / DEV-MEMO.md を frameworks-now 仕様に書き換え

## Phase 2: クローラー実装 ✅

### 構成
```
crawler/src/
├── config.js         # フレームワーク定義（94件）
├── sources/
│   ├── github.js     # GitHub repo情報 + Releases/Tags
│   ├── registry.js   # npm / PyPI / crates.io / RubyGems / Packagist
│   └── downloads.js  # 週間DL（npm / PyPI Stats）
└── index.js          # エントリーポイント（並列実行 + キャッシュフォールバック）
```

### データソース
| 管理タイプ | バージョン取得元 |
| ---------- | ---------------- |
| npm        | `registry.npmjs.org/<pkg>`（time フィールドで履歴取得） |
| pypi       | `pypi.org/pypi/<pkg>/json`（releases で履歴取得） |
| crates     | `crates.io/api/v1/crates/<name>`（UA ヘッダ必須） |
| gem        | `api.rubygems.org/api/v1/gems/<name>.json` |
| packagist  | `repo.packagist.org/p2/<vendor>/<pkg>.json` |
| なし       | GitHub Releases API → 空なら Tags API |

### GitHub API レート制限対策
- CI: `GITHUB_TOKEN`（1000回/h）
- ローカル: `gh api`（認証済み CLI）→ 未認証リクエストの順にフォールバック
- 取得失敗時は前回 `data/frameworks.json` の値でフォールバック

## Phase 3: データ生成 ✅

- `data/frameworks.json`（94件のスナップショット）を生成
- `data/releases.json`（各フレームワーク最大30件のリリース履歴）を生成
- 旧 `data/{nodejs,python,rust,go,tauri}.json` は削除

## Phase 4: Astro サイト実装 ✅

### ページ構成
```
site/src/
├── pages/
│   ├── index.astro                # 一覧（統計ヘッダー + フィルタ + ソート + カードグリッド）
│   ├── frameworks/[id].astro      # 詳細（ヒーロー + 統計カード + リリース履歴表）
│   └── 404.astro
├── components/
│   ├── FrameworkCard.astro
│   ├── StatsBar.astro
│   └── ReleaseTable.astro
├── layouts/Layout.astro
└── lib/data.js                    # frameworks.json / releases.json 読み込み
```

- フィルタ（`?category=` / `?lang=`）とソート（`?sort=`）はクエリパラメータで実現（JS 不使用）
- `getStaticPaths` で全フレームワークの詳細ページを静的生成
- Neo Brutalism デザインを維持

### 設定変更
- `astro.config.mjs`: `base: '/frameworks-now'` に変更
- 各 `package.json`: パッケージ名を frameworks-now 系に変更
- 旧クローラー（nodejs / python / rust / go / tauri）を削除

## Phase 5: CI 更新 ✅

- `.github/workflows/crawl-and-deploy.yml`
  - setup-go を削除（Go クローラー廃止）
  - crawl ジョブに `GITHUB_TOKEN` を env で渡す
  - cron（JST 5:00）と Pages デプロイは維持

## Phase 6: デプロイ確認

- `workflow_dispatch` で動作確認
- <https://watanabe3tipapa.github.io/frameworks-now/>

---

## 本番URL

<https://watanabe3tipapa.github.io/frameworks-now/>
