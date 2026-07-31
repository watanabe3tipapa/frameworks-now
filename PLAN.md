# standard-libraries-now

Node.js / Python / Rust / Go / Tauri など主要なツールの標準ライブラリ一覧を静的サイトとして生成するツール。

---

## 要件

- GitHub Pages で公開
- 日次（JST 午前5時）で WEB 巡回して最新情報を取得
- 対象言語: Node.js, Python（必須）, Rust, Go, Tauri（追加予定）
- デザイン: Neo Brutalism 基調

---

## 技術スタック

| レイヤー       | 採用技術             |
| -------------- | -------------------- |
| 静的サイト生成 | Astro                |
| データ形式     | JSON（クローラー出力兼サイト入力） |
| デザイン       | Tailwind CSS（Neo Brutalism カスタム） |
| CI/CD          | GitHub Actions       |
| ホスティング   | GitHub Pages         |
| クローラー     | Node.js（後述の理由で統一） |

### Astro を選んだ理由
- コンテンツ駆動の静的サイト生成が得意（JSON / Markdown を直接読める）
- バンドルサイズが小さく、Pages との相性が良い
- 学習コストが低く、必要十分

### クローラーを Node.js に統一する理由
- サイト生成と同じ言語でメンテナンスしやすい
- Python の標準ライブラリ情報は `pydoc` / `docs.python.org` のスクレイピングで取得可能
- Rust / Go / Tauri の情報取得も npm パッケージやスクレイピングで対応できる

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
                  │  src/pages/             │
                  │  src/components/        │
                  └──────┬──────────────────┘
                         │ astro build → dist/
                         ▼
                  ┌─────────────────────────┐
                  │  GitHub Pages 公開       │
                  └─────────────────────────┘
```

---

## データソース

| 言語     | 取得元                                                            |
| -------- | ----------------------------------------------------------------- |
| Node.js  | `https://nodejs.org/api/index.json` または公式ドキュメントのスクレイピング |
| Python   | `pydoc` コマンド出力 または `docs.python.org` のスクレイピング               |
| Rust     | `docs.rs` / `doc.rust-lang.org/std/index.html`                     |
| Go       | `pkg.go.dev/std`                                                   |
| Tauri    | `tauri.app` 公式APIドキュメント                                     |

各JSONのスキーマ（共通）:
```json
{
  "language": "nodejs",
  "version": "22.0.0",
  "updatedAt": "2026-07-31T05:00:00+09:00",
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
│   │   ├── pages/           # ページコンポーネント
│   │   ├── components/      # UI コンポーネント
│   │   ├── layouts/         # レイアウト
│   │   └── styles/          # Neo Brutalism 用スタイル
│   ├── public/
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
│   └── ...
├── .github/workflows/
│   └── crawl-and-deploy.yml
└── PLAN.md
```

---

## デザイン（Neo Brutalism）

### 基本ルール
- 太い黒枠: `border: 3px solid #000`
- 背景: 白＋単色ブロック（#fff, #f5f5f5）
- アクセントカラー: 蛍光イエロー `#FFE600`, ピンク `#FF69B4`, シアン `#00E5FF`
- フォント: ゴシック系（`system-ui`, `Inter`）太字多用
- シャドウやグラデーションは使わない
- カードはフラット、角丸は小さく（`border-radius: 4px`）

### 実装方針
- Tailwind CSS のユーティリティクラスでカバー
- 共通カードコンポーネントを作り、全ページで統一

---

## CI/CD（GitHub Actions）

### スケジュール
- cron: `0 20 * * *`（UTC 20:00 = JST 5:00 冬時間）
- 冬/夏の変わり目は手動トリガーで調整

### ワークフロー
1. `schedule` または `workflow_dispatch` で起動
2. 各クローラーを実行 → `data/*.json` を更新
3. `git commit & push`（更新があった場合のみ）
4. `astro build` 実行 → `dist/` 生成
5. `peaceiris/actions-gh-pages` などで `gh-pages` ブランチにデプロイ

---

## マイルストーン

| Phase | 内容                                     |
| ----- | ---------------------------------------- |
| 0     | PLAN.md 確定                             |
| 1     | Astro プロジェクトセットアップ + ダミーデータでトップページ表示 |
| 2     | Node.js クローラー実装 + JSON 出力         |
| 3     | Python クローラー実装                     |
| 4     | サイトにデータバインディング（一覧・詳細ページ） |
| 5     | Neo Brutalism デザイン適用                |
| 6     | GitHub Actions の cron デプロイ設定        |
| 7     | Rust / Go / Tauri クローラー順次追加       |

---

## 注意事項

- スクレイピング先への負荷を考慮し、最低限のリクエスト頻度にする
- 各クローラーは独立して実行可能にし、途中の言語でエラーが出ても他に影響しない設計
- GitHub Pages のビルド制限（10分 / 月1000回）に収まるサイズに抑える
