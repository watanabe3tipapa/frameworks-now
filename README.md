# standard-libraries-now

Node.js / Python / Rust / Go / Tauri の標準ライブラリ一覧を日次クロールし、静的サイトとして公開するツールです。

<https://watanabe3tipapa.github.io/standard-libraries-now/>

---

## 対象言語

| 言語 | モジュール数 | バージョン |
|------|------------|-----------|
| Node.js | 57 | 26.5.1 |
| Python | 312 | 3.14.6 |
| Rust | 42 | 1.97.1 |
| Go | 250 | 1.26.2 |
| Tauri | 11 | 2.11.1 |

全 672 モジュールをトップページの階層型UI（言語 → カテゴリ → モジュール）から参照できます。

---

## 技術スタック

### フロントエンド

| 技術 | 採用理由 |
|------|---------|
| [Astro](https://astro.build) | JSONデータを直接読み込んで静的なHTMLを生成。軽量で高速 |
| CSS（プレーン） | フレームワークに依存しない。Neo Brutalism デザインを素のCSSで実装 |
| `<details>` / `<summary>` | JavaScript を使用せずにアコーディオンUIを実現（アクセシビリティにも配慮） |

### クローラー

| 技術 | 採用理由 |
|------|---------|
| Node.js | サイト側と同じ言語で統一。メンテナンス性を重視 |
| [cheerio](https://cheerio.js.org) | 軽量なHTMLパーサ。jQueryライクな記述でスクレイピングを実装 |
| `child_process` | Goの標準ライブラリ一覧取得のため `go list std` を実行 |

### CI/CD

| 技術 | 採用理由 |
|------|---------|
| GitHub Actions | cron による日次実行と Pages デプロイを一貫して管理 |
| GitHub Pages | 無料で利用可能。Actions との連携がスムーズ |

---

## 処理フロー

```
毎日5:00 (JST) → クローラー起動 → data/*.json 更新 → Astro ビルド → GitHub Pages へデプロイ
```

---

## デザイン

Neo Brutalism を採用しています。

- 太い黒枠: `border: 3px solid #000`
- アクセントカラー: 蛍光イエロー `#FFE600`、ピンク `#FF69B4`、シアン `#00E5FF`
- フラットなカード、シャドウなし（hover 時のみ浮かせる）
- 角丸は最小限に抑える

---

## 実行方法

ルートディレクトリから以下を実行できます。

```bash
# 全行程（クロール → サイト生成）
npm run run

# クロールのみ
npm run crawl

# サイト生成のみ
npm run build
```

個別に実行する場合:

```bash
cd crawler && npm run crawl:all   # 全言語のクロールを実行
cd site && npm run build          # 静的サイトを生成
```

---

## ディレクトリ構成

```
standard-libraries-now/
├── site/               Astro プロジェクト（ページ・レイアウト）
├── crawler/            クローラー（言語別に実装）
├── data/               クロール結果の JSON
├── .github/workflows/  GitHub Actions 設定
├── package.json        ルート実行用スクリプト
├── PLAN.md             設計書
└── DEV-MEMO.md         実装履歴
```
