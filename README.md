# frameworks-now

A daily-updated index of major web frameworks across languages. Versions, GitHub stars, download counts, and release histories are crawled automatically every morning and published as a static site.

Live site: https://watanabe3tipapa.github.io/frameworks-now/

Last updated: 2026-08-21

---

## Overview

frameworks-now collects and publishes metadata for many web frameworks (versions, release history, GitHub stars, download counts, license, etc.) as a static site. The data is refreshed daily by an automated crawler and published as a static site (no client-side JavaScript required).

## Features

- Daily crawling — GitHub Actions runs at 5:00 JST and refreshes framework data automatically
- Coverage of 90+ frameworks across 7 categories (Frontend, Full-stack, Backend, Static-site, Mobile, Desktop, Styling)
- Tracks latest version, release date, GitHub stars, weekly downloads, and license
- Per-framework detail pages with release history tables
- Neo Brutalism design — flat cards, thick black borders, and neon accents

## Framework Categories (examples)

| Category | Examples |
| -------- | -------- |
| Frontend | React, Vue, Svelte, Angular, Solid, Qwik, Preact, Lit |
| Full-stack | Next.js, Nuxt, SvelteKit, Remix, Astro, Django, Rails, Laravel |
| Backend | Express, Fastify, FastAPI, Spring Boot, Gin, Axum, ASP.NET Core |
| Static-site | Docusaurus, VitePress, Eleventy, Hugo, Jekyll |
| Mobile | React Native, Flutter, Ionic, Expo |
| Desktop | Electron, Tauri, Wails, .NET MAUI |
| Styling | Tailwind CSS, Bootstrap, Material UI, shadcn/ui |

## Quick start

Clone the repository and install dependencies for the crawler and the site:

```bash
# Clone the repository
git clone https://github.com/watanabe3tipapa/frameworks-now.git

# Install crawler dependencies
cd crawler
npm install

# Install site dependencies
cd ../site
npm install
```

## Usage

From the repository root:

```bash
# Full pipeline (crawl + build)
npm run run

# Crawl all frameworks only
npm run crawl

# Build the static site only
npm run build
```

Note: the crawler calls the GitHub API. Provide a `GITHUB_TOKEN` environment variable to avoid rate limits. When no token is set, the authenticated `gh` CLI is used as a fallback, and finally unauthenticated requests.

## Data sources

- Version & release history: npm registry, PyPI, crates.io, Packagist, GitHub Releases (as applicable)
- GitHub metadata (stars, forks, issues, license): GitHub API (`repos/<owner>/<name>`)
- Weekly downloads: npm downloads API, PyPI Stats, crates.io

Crawl output is stored in:

- `data/frameworks.json` — current snapshot of every framework
- `data/releases.json` — release history for every framework

## Project structure (high level)

- assets/ — repository assets
- crawler/ — crawler code and configuration (framework list and data collection)
- data/ — generated crawl output (`frameworks.json`, `releases.json`)
- site/ — static site source and build
- package.json — repository-level scripts
- DEV-MEMO.md, PLAN.md — development notes

Scripts provided in package.json (repository root):

- `crawl` — runs the crawler (cd crawler && npm run crawl:all)
- `build` — builds the site (cd site && npm run build)
- `run` — runs crawl then build

## Contributing

Contributions are welcome. Add or update frameworks in `crawler/src/config.js`.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-change`)
3. Commit your changes (`git commit -m 'Add or update frameworks'`)
4. Push to the branch (`git push origin feature/your-change`)
5. Open a Pull Request

## License

MIT License

## Contact

GitHub: https://github.com/watanabe3tipapa/frameworks-now
