# frameworks-now

A daily-updated index of major web frameworks across languages. Versions, GitHub stars, download counts, and release histories are crawled automatically every morning and published as a static site.

Live site: <https://watanabe3tipapa.github.io/frameworks-now/>

## Features

- **Daily crawling** — GitHub Actions runs at 5:00 JST and refreshes framework data automatically
- **90+ frameworks, 7 categories** — Frontend / Full-stack / Backend / Static-site / Mobile / Desktop / Styling
- **Cross-language coverage** — TypeScript, JavaScript, Python, Ruby, PHP, Java, Go, Rust, C#, Dart
- **Version & popularity tracking** — latest version, release date, GitHub stars, weekly downloads, license
- **Release history** — per-framework detail pages with version history tables
- **Neo Brutalism design** — flat cards, thick black borders, and neon accents (no JavaScript required)

## Framework Categories

| Category | Examples |
| -------- | -------- |
| Frontend | React, Vue, Svelte, Angular, Solid, Qwik, Preact, Lit |
| Full-stack | Next.js, Nuxt, SvelteKit, Remix, Astro, Django, Rails, Laravel |
| Backend | Express, Fastify, FastAPI, Spring Boot, Gin, Axum, ASP.NET Core |
| Static-site | Docusaurus, VitePress, Eleventy, Hugo, Jekyll |
| Mobile | React Native, Flutter, Ionic, Expo |
| Desktop | Electron, Tauri, Wails, .NET MAUI |
| Styling | Tailwind CSS, Bootstrap, Material UI, shadcn/ui |

## Installation

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

> Note: the crawler calls the GitHub API. Provide a `GITHUB_TOKEN` environment variable
> to avoid rate limits. When no token is set, the authenticated `gh` CLI is used as a
> fallback, and finally unauthenticated requests.

## Data Sources

| Data | Source |
| ---- | ------ |
| Version & release history | npm registry / PyPI / crates.io / Packagist / GitHub Releases |
| Stars, forks, issues, license | GitHub API (`repos/<owner>/<name>`) |
| Weekly downloads | npm downloads API / PyPI Stats / crates.io |

Crawl output is stored in two files:

- `data/frameworks.json` — current snapshot of every framework
- `data/releases.json` — release history for every framework

## Contributing

Contributions are welcome! Add or update frameworks in `crawler/src/config.js`.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

License not yet specified.

## Contact

GitHub: [https://github.com/watanabe3tipapa/frameworks-now](https://github.com/watanabe3tipapa/frameworks-now)
