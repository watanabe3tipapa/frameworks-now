[![standard-libraries-now](assets/banner.svg)](https://github.com/watanabe3tipapa/standard-libraries-now)

<!-- badges -->
[![Deployment](https://img.shields.io/github/deployments/watanabe3tipapa/standard-libraries-now/github-pages)](https://github.com/watanabe3tipapa/standard-libraries-now/deployments)

[English](README.md) | [日本語](README_ja.md)

# standard-libraries-now

Node.js / Python / Rust / Go / Tauri の標準ライブラリ一覧を毎日自動クロールし、静的サイトとして公開するツールです。

公開サイト: <https://watanabe3tipapa.github.io/standard-libraries-now/>

## 特徴

- **毎日自動クロール** — GitHub Actions が JST 5:00 に起動し、ライブラリデータを自動更新します
- **5言語・672モジュール** — Node.js / Python / Rust / Go / Tauri
- **シングルページのドリルダウンUI** — 言語 → カテゴリ → モジュールの順に展開。ネイティブHTML（`<details>` / `<summary>`）のみで実装し、JavaScriptは使用しません
- **Neo Brutalism デザイン** — フラットなカード、太い黒枠、蛍光アクセントカラー

## スクリーンショット

<!-- スクリーンショットをここに追加 -->
![スクリーンショット](https://watanabe3tipapa.github.io/standard-libraries-now/)

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/watanabe3tipapa/standard-libraries-now.git

# クローラーの依存関係をインストール
cd crawler
npm install

# サイトの依存関係をインストール
cd ../site
npm install
```

## 使い方

リポジトリルートから実行します。

```bash
# 全行程を実行（クロール → ビルド）
npm run run

# クロールのみ
npm run crawl

# ビルドのみ
npm run build
```

## コントリビューション

コントリビューションは大歓迎です！

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## ライセンス

ライセンスは未指定です。

## 連絡先

GitHub: [https://github.com/watanabe3tipapa/standard-libraries-now](https://github.com/watanabe3tipapa/standard-libraries-now)
