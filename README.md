# 📦 standard-libraries-now

主要言語の標準ライブラリを**毎日クロール**して一覧にしてくれるやつ。

> 🌐 https://watanabe3tipapa.github.io/standard-libraries-now/

---

## 対象言語

| 言語 | モジュール数 | バージョン |
|------|------------|-----------|
| Node.js | 57 | 26.5.1 |
| Python | 312 | 3.14.6 |
| Rust | 42 | 1.97.1 |
| Go | 250 | 1.26.2 |
| Tauri | 11 | 2.11.1 |

**合計 672 モジュール** を1ページでドリルダウン表示。

---

## 使ってるもの

### フロントエンド

| これ | なんで |
|------|--------|
| [Astro](https://astro.build) | 静的サイト生成。JSONからページを作るのが得意 |
| プレーンCSS | Tailwindとか使わず生で書いてる。Neo Brutalismなんでシンプルが正義 |
| `<details>` / `<summary>` | アコーディオンUIを実現。**JSゼロ**で動くのがポイント |

### クローラー

| これ | なんで |
|------|--------|
| Node.js | サイトもNode.jsなんで統一。言語切り替えなくて済む |
| [cheerio](https://cheerio.js.org) | jQueryライクにHTMLをパース。軽いし直感的 |
| `child_process` | Goだけ `go list std` 叩いてるのでそのために |

### CI/CD

| これ | なんで |
|------|--------|
| GitHub Actions | cronで毎日クロール → コミット → デプロイ まで一気通貫 |
| GitHub Pages | 無料。Actionsから直接デプロイできる |

### フロー

```
毎朝5時 (JST) ─→ クローラー起動 ─→ data/*.json 更新 ─→ Astroビルド ─→ GitHub Pages 公開
                                                        ↕
                                              全部トップページに
                                              3階層で展開表示
```

---

## デザインの話

**Neo Brutalism** ってやつ。

- 太い黒枠 (`border: 3px solid #000`)
- 蛍光色アクセント (`#FFE600`, `#FF69B4`, `#00E5FF`)
- フラットなカード、シャドウなし（hover時だけ浮かせる）
- ダサかっこいいを目指した

---

## 動かし方

ルートから一発:

```bash
npm run run     # 強制フル実行（クロール → ビルド）
npm run crawl   # クロールだけ
npm run build   # ビルドだけ
```

中身を追うなら:

```bash
cd crawler && npm run crawl:all   # 全言語クロール
cd site && npm run build          # サイト生成
open site/dist/index.html         # 開く
```
