# DEV-MEMO — 実装履歴

## Phase 1: Astro セットアップ + ダミーデータ表示 ✅

- Astro 5.18.2 プロジェクトを `site/` に作成
- `data/` にダミーJSON（Node.js, Python）を配置
- トップページでダミーデータを一覧表示
- Neo Brutalism デザインをプレーンCSSで適用（Tailwind CSS 不使用）

## Phase 2: Node.js クローラー ✅

- データソース: `https://nodejs.org/api/` の HTML を cheerio でパース
- ナビゲーションサイドバーからモジュール一覧とカテゴリを抽出
- カテゴリ: Core / Process & File System / Network / Async & Streams / Data & Crypto / Debug & Testing / Runtime
- 57モジュール + 7カテゴリ取得 (v26.5.1)

## Phase 3: Python クローラー ✅

- データソース: `https://docs.python.org/3/py-modindex.html` を cheerio でパース
- モジュールインデックステーブルから全モジュール抽出、22カテゴリに分類
- 312モジュール取得 (v3.14.6)
- 削除済みモジュールは `status: deprecated` でマーク

## Phase 4: データバインディング + 言語別ページ ✅

- 共有データローダー作成 (`site/src/lib/data.js`)
- トップページ: 言語カード（モジュール数・カテゴリタグ付き）
- 動的ルート `/[language]/` で言語別詳細ページ

## Phase 5: デザイン調整 ✅

- favicon.svg 追加（Neo Brutalism "SL" ロゴ）
- 404 ページ作成
- 全ページ Neo Brutalism スタイル統一（hover エフェクト、ステータスバッジ）

## Phase 6: GitHub Actions ✅

- `.github/workflows/crawl-and-deploy.yml` 作成
  - cron: JST 5:00 (UTC 20:00) で自動実行
  - `workflow_dispatch` で手動トリガー可能
  - クロール → JSON更新 → Astroビルド → GitHub Pages デプロイ
- GitHub Pages 設定: `build_type: workflow`

## Phase 7: Rust / Go / Tauri クローラー ✅

| 言語 | モジュール数 | カテゴリ数 | バージョン | データソース |
|------|------------|-----------|-----------|------------|
| Rust | 42 | 7 | 1.97.1 | doc.rust-lang.org/std/ |
| Go   | 248 | 14 | 1.26.2 | go list std コマンド |
| Tauri | 11 | 3 | 2.11.1 | @tauri-apps/api v2 |

全5言語・計670モジュールのクロールが完了。
`crawl:all` スクリプトで一括実行可能。

## Phase 8: シングルページ展開UIにリファクタリング ✅

- `[language]/` 動的ルートを削除し、全言語のデータをトップページに統合
- `<details>` / `<summary>` の3階層ネストでアコーディオンUIを実現（JS不要）
  - 言語カード → カテゴリ → モジュールカード の順に展開
- モジュールカードは公式ドキュメントへ外部リンク (`target="_blank"`)
- Neo Brutalism 維持: `details[open]` で背景変化、hover で蛍光色 `#FFE600`
- 全670モジュールを1ページに静的生成、ビルド0.8秒・出力276KB

## 追録: Actions バージョンアップデート ✅

- Node.js 20 非推奨警告に対応
- `actions/checkout@v4` → `v7`
- `actions/setup-node@v4` → `v7`
- `actions/configure-pages@v4` → `v6`
- `actions/upload-pages-artifact@v3` → `v5`
- `actions/deploy-pages@v4` → `v5`
- `workflow_dispatch` で動作確認済み、警告消失

## 追録: Go データの環境依存問題を解消 ✅

- 問題1: `go version` が実行マシンのGoに依存し、ローカル(1.26.2) と GitHub Actions ランナー(1.24.13) でデータが不一致
  - 対応: `actions/setup-go@v5` で `go-version: '1.26.2'` を固定
- 問題2: `go list std` の出力が OS に依存（darwin/linux で差分）
  - 対応: クローラー側で `GOOS=linux GOARCH=amd64 CGO_ENABLED=0` を固定して実行
  - 以後、ローカルとCIで同一データ（Go 1.26.2 / 248 modules）が生成される
- 問題3: ビルドジョブがクロールジョブのコミット前のデータでビルドしていた
  - 対応: `actions/checkout` に `ref: デフォルトブランチ` を指定し、最新の data/ を取得
- Go モジュール数: 250 → 248（`runtime/cgo` 等を CGO_ENABLED=0 により除外）
- 全言語合計: 672 → 670

## 本番URL

<https://watanabe3tipapa.github.io/standard-libraries-now/>
