# standard-libraries-now

Node.js / Python / Rust / Go / Tauri の標準ライブラリ一覧を日次クロールし、静的サイトとして公開するツール。

---

## 要件

- GitHub Pages で公開
- 日次（JST 午前5時）で WEB 巡回して最新情報を取得
- 対象言語: Node.js, Python, Rust, Go, Tauri
- デザイン: Neo Brutalism 基調

---

## 技術スタック

| レイヤー       | 採用技術                              |
| -------------- | ------------------------------------- |
| 静的サイト生成 | Astro                                 |
| データ形式     | JSON（クローラー出力兼サイト入力）     |
| デザイン       | プレーンCSS（Neo Brutalism カスタム） |
| CI/CD          | GitHub Actions                        |
| ホスティング   | GitHub Pages                          |
| クローラー     | Node.js（全言語統一）                 |

### Astro を選んだ理由
- コンテンツ駆動の静的サイト生成が得意（JSON を直接読める）
- バンドルサイズが小さく、Pages との相性が良い
- 学習コストが低く、必要十分

### クローラーを Node.js に統一する理由
- サイト生成と同じ言語でメンテナンスしやすい
- cheerio で HTML スクレイピング、`child_process` で CLI ツール連携が可能
- 全言語を同じ実装パターンで書ける

---

## アーキテクチャ

```
                  クロール (GitHub Actions cron)
                  ┌─────────────────────────┐
                  │  crawler/               │
                  │  ├── nodejs/            │
                  │  ├── python/            │
                  │  ├── rust/              │
                  │  ├── go/                │
                  │  └── tauri/             │
                  └──────┬──────────────────┘
                         │ JSON出力
                         ▼
                  ┌─────────────────────────┐
                  │  data/                  │
                  │  ├── nodejs.json        │
                  │  ├── python.json        │
                  │  ├── rust.json          │
                  │  ├── go.json            │
                  │  └── tauri.json         │
                  └──────┬──────────────────┘
                         │ Astroがビルド時に読み込み
                         ▼
                  ┌─────────────────────────┐
                  │  site/ (Astro)          │
                  │  src/pages/index.astro  │
                  │  src/layouts/           │
                  │  src/lib/data.js        │
                  └──────┬──────────────────┘
                         │ astro build → dist/
                         ▼
                  ┌─────────────────────────┐
                  │  GitHub Pages 公開       │
                  └─────────────────────────┘
```

---

## データソース

| 言語     | 取得元                                               |
| -------- | ---------------------------------------------------- |
| Node.js  | `https://nodejs.org/api/` サイドバーをスクレイピング |
| Python   | `https://docs.python.org/3/py-modindex.html`         |
| Rust     | `https://doc.rust-lang.org/std/`                     |
| Go       | `go list std` コマンド出力                           |
| Tauri    | `@tauri-apps/api` npm パッケージ                     |

各JSONのスキーマ（共通）:
```json
{
  "language": "nodejs",
  "label": "Node.js",
  "version": "26.5.1",
  "updatedAt": "2026-07-31T01:06:50.976Z",
  "categories": [
    {
      "name": "File System",
      "modules": [
        {
          "name": "fs",
          "url": "https://nodejs.org/api/fs.html",
          "description": "File system operations",
          "status": "stable"
        }
      ]
    }
  ]
}
```

---

## ディレクトリ構成

```
standard-libraries-now/
├── site/                    # Astro プロジェクト
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro  # トップページ（全言語・全モジュールを展開表示）
│   │   │   └── 404.astro
│   │   ├── layouts/
│   │   │   └── Layout.astro
│   │   └── lib/
│   │       └── data.js      # data/*.json 読み込み
│   ├── public/
│   │   └── favicon.svg
│   ├── astro.config.mjs
│   └── package.json
├── crawler/                 # クローラー群
│   ├── src/
│   │   ├── nodejs/
│   │   ├── python/
│   │   ├── rust/
│   │   ├── go/
│   │   └── tauri/
│   └── package.json
├── data/                    # クロール結果のJSON（Git管理）
│   ├── nodejs.json
│   ├── python.json
│   ├── rust.json
│   ├── go.json
│   └── tauri.json
├── .github/workflows/
│   └── crawl-and-deploy.yml
├── PLAN.md
└── DEV-MEMO.md
```

---

## デザイン（Neo Brutalism）

### 基本ルール
- 太い黒枠: `border: 3px solid #000`
- 背景: 白＋単色ブロック（#fff, #f5f5f5）
- アクセントカラー: 蛍光イエロー `#FFE600`, ピンク `#FF69B4`, シアン `#00E5FF`
- フォント: ゴシック系（`system-ui`, `Inter`）太字多用
- シャドウやグラデーションは使わない（hover時のみ `box-shadow` で浮かせる）
- カードはフラット、角丸は小さく（`border-radius: 4px`）

### UI構造
- トップページに全言語・全モジュールを3階層の `<details>` / `<summary>` で展開表示
- 言語カード → カテゴリ → モジュールカード（公式ドキュメントへのリンク）
- JavaScript 不使用、HTML/CSS ネイティブ

---

## CI/CD（GitHub Actions）

### スケジュール
- cron: `0 20 * * *`（UTC 20:00 = JST 5:00 冬時間）
- `workflow_dispatch` で手動トリガー可能

### ワークフロー
1. `schedule` または `workflow_dispatch` で起動
2. 各クローラーを実行 → `data/*.json` を更新
3. `git commit & push`（更新があった場合のみ）
4. `astro build` 実行 → `dist/` 生成
5. `actions/upload-pages-artifact` + `actions/deploy-pages` でデプロイ

---

## マイルストーン

| Phase | 内容                                                  |
| ----- | ----------------------------------------------------- |
| 0     | PLAN.md 確定                                          |
| 1     | Astro セットアップ + ダミーデータ表示 + Neo Brutalism |
| 2     | Node.js クローラー実装（57 modules, 7 categories）    |
| 3     | Python クローラー実装（312 modules, 23 categories）   |
| 4     | データローダー作成 + 言語別ページ                      |
| 5     | favicon + 404 ページ + デザイン統一                   |
| 6     | GitHub Actions cron デプロイ設定                      |
| 7     | Rust / Go / Tauri クローラー追加（計672 modules）     |
| 8     | シングルページUIにリファクタリング（`<details>` ネスト）|

---

## Actions バージョン管理

| アクション                    | 採用バージョン |
| ----------------------------- | -------------- |
| `actions/checkout`            | v7             |
| `actions/setup-node`          | v7             |
| `actions/configure-pages`     | v6             |
| `actions/upload-pages-artifact` | v5           |
| `actions/deploy-pages`        | v5             |

---

## 注意事項

- スクレイピング先への負荷を考慮し、最低限のリクエスト頻度にする
- 各クローラーは独立して実行可能にし、途中の言語でエラーが出ても他に影響しない設計
- GitHub Pages のビルド制限（10分 / 月1000回）に収まるサイズに抑える
