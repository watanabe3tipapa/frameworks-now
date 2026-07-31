# DEV-MEMO

## Phase 1: Astro セットアップ + ダミーデータ表示 ✅

- Astro プロジェクトを `site/` に作成 ✅
- `data/` にダミーJSONを配置 ✅
- トップページでダミーデータを一覧表示 ✅
- Neo Brutalism デザイン適用 ✅

## Phase 2: Node.js クローラー ✅

- データソース: `https://nodejs.org/api/` の HTML パース ✅
- 出力先: `data/nodejs.json` ✅
- cheerio でナビゲーションサイドバーからモジュール一覧を抽出 ✅
- カテゴリ分類: Core / Process & File System / Network / Async & Streams / Data & Crypto / Debug & Testing / Runtime ✅
- 57モジュール取得 (v26.5.1) ✅

## Phase 3: Python クローラー ✅

- データソース: `https://docs.python.org/3/py-modindex.html` ✅
- cheerio でモジュールインデックステーブルから全モジュール抽出 ✅
- カテゴリ分類: 22カテゴリ (Data Types, Networking, File System 等) ✅
- 312モジュール取得 (v3.14.6) ✅
- 削除済みモジュールは `status: deprecated` でマーク ✅

## Phase 4: サイトのページ構成リファクタリング ✅

- 共有データローダー作成 (`site/src/lib/data.js`) ✅
- トップページ → 言語概要ページに変更（言語カード + カテゴリタグ + モジュール数） ✅
- 言語別ページ作成 (dynamic route: `/[language]/`) ✅
  - Node.js: 57 modules, 7 categories
  - Python: 312 modules, 22 categories
- Neo Brutalism スタイル統一（hover エフェクト, ステータスバッジ, グリッドレイアウト） ✅

## Phase 5: デザイン調整 ✅

- favicon.svg 追加（Neo Brutalism スタイル "SL" ロゴ） ✅
- 404 ページ作成 ✅
- 全ページ Neo Brutalism 統一 ✅

## Phase 6: GitHub Actions ✅

- `.github/workflows/crawl-and-deploy.yml` 作成 ✅
  - cron: JST 5:00 (UTC 20:00) で自動実行
  - `workflow_dispatch` で手動トリガー可能
  - クロール → JSON更新 → Astroビルド → GitHub Pages デプロイ

## Phase 7: Rust / Go / Tauri クローラー ✅

| 言語 | モジュール数 | カテゴリ数 | バージョン | データソース |
|------|------------|-----------|-----------|------------|
| Rust | 42 | 7 | 1.97.1 | doc.rust-lang.org/std/ |
| Go   | 250 | 14 | 1.26.2 | go list std |
| Tauri | 11 | 3 | 2.11.1 | @tauri-apps/api v2 |

## Phase 8: シングルページ展開UIにリファクタリング ✅

- `[language]/` 動的ルートを削除し、全言語のデータをトップページに統合 ✅
- HTML ネイティブの `<details>` / `<summary>` 要素でネスト型アコーディオンを実現 ✅
  - 言語カード → カテゴリ → モジュールカード の3階層
  - JavaScript ゼロ、HTML/CSS のみで動作
- モジュールカードは公式ドキュメントへの外部リンク (`target="_blank"`) ✅
- デザイン: Neo Brutalism 維持、`:hover` で蛍光色 `#FFE600`、`details[open]` で背景変化 ✅
- 全672モジュールを1ページに静的生成 ✅
