import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DATA_DIR = resolve(ROOT, 'data')
const NODEJS_URL = 'https://nodejs.org/api/'

const NON_MODULE_KEYWORDS = [
  'about this documentation',
  'usage and example',
  'command-line options',
  'deprecated apis',
  'c++ addons',
  'node-api',
  'c++ embedder',
  'modules: packages',
  'modules: typescript',
  'single executable',
  'code repository',
  'index',
]

const CATEGORY_MAP = [
  { pattern: /^(buffer|console|errors|events|globals|util|punycode|querystring|string_decoder|url)/i, name: 'Core' },
  { pattern: /^(fs|path|os|process|child_process|cluster|worker_threads|vfs)/i, name: 'Process & File System' },
  { pattern: /^(http|https|http2|net|dgram|dns|tls)/i, name: 'Network' },
  { pattern: /^(stream|readline|repl|timers|async_hooks|async_context)/i, name: 'Async & Streams' },
  { pattern: /^(crypto|webcrypto|webstreams|sqlite|zlib)/i, name: 'Data & Crypto' },
  { pattern: /^(test|debugger|inspector|report|tracing|perf_hooks|diagnostics_channel|assert)/i, name: 'Debug & Testing' },
  { pattern: /^(permissions|v8|vm|wasi|ffi|module|modules|esm|packages|typescript|intl|tty|domain|environment_variables|single-executable-applications)/i, name: 'Runtime' },
]

function categorize(fileName) {
  for (const entry of CATEGORY_MAP) {
    if (entry.pattern.test(fileName)) return entry.name
  }
  return 'Other'
}

async function fetchNodeJsModules() {
  const res = await fetch(NODEJS_URL)
  const html = await res.text()
  const $ = cheerio.load(html)

  const version = $('h1').text().match(/v?(\d+\.\d+\.\d+)/)?.[1] || 'unknown'
  const modules = []

  $('#column2 ul li a').each((_, el) => {
    const $el = $(el)
    const name = $el.text().trim()
    const href = $el.attr('href') || ''
    const moduleName = href.replace('.html', '')

    if (!href.endsWith('.html')) return
    if (NON_MODULE_KEYWORDS.some(k => name.toLowerCase().includes(k))) return
    if (name.startsWith('<code>')) return

    modules.push({
      name: moduleName,
      displayName: name.replace(/<[^>]*>/g, '').trim(),
      url: `https://nodejs.org/api/${href}`,
    })
  })

  const categories = []
  const grouped = {}

  for (const mod of modules) {
    const cat = categorize(mod.name)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({
      name: mod.name,
      url: mod.url,
      description: mod.displayName,
      status: 'stable',
    })
  }

  for (const [name, mods] of Object.entries(grouped)) {
    categories.push({ name, modules: mods })
  }

  return {
    language: 'nodejs',
    label: 'Node.js',
    version,
    updatedAt: new Date().toISOString(),
    categories,
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const data = await fetchNodeJsModules()
  const outPath = resolve(DATA_DIR, 'nodejs.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Modules: ${data.categories.reduce((a, c) => a + c.modules.length, 0)}`)
}

main().catch(console.error)
