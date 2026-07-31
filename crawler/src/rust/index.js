import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DATA_DIR = resolve(ROOT, 'data')
const RUST_URL = 'https://doc.rust-lang.org/std/index.html'

const CATEGORY_MAP = [
  { pattern: /^(alloc|any|array|ascii|borrow|cell|cmp|convert|default|hash|hint|iter|marker|mem|ops|option|pin|ptr|range|result|slice|string|str|char)/i, name: 'Core Types' },
  { pattern: /^(collections|vec|map|set)/i, name: 'Collections' },
  { pattern: /^(fs|path|env|os|process|thread|time|io|net)/i, name: 'System & I/O' },
  { pattern: /^(sync|rc|atomic)/i, name: 'Concurrency' },
  { pattern: /^(future|task)/i, name: 'Async' },
  { pattern: /^(error|panic)/i, name: 'Error Handling' },
  { pattern: /^(ffi|primitive|prelude|num|panic|arch|backtrace)/i, name: 'Runtime & FFI' },
]

function categorize(moduleName) {
  for (const entry of CATEGORY_MAP) {
    if (entry.pattern.test(moduleName)) return entry.name
  }
  return 'Other'
}

async function fetchRustModules() {
  const res = await fetch(RUST_URL)
  const html = await res.text()
  const $ = cheerio.load(html)

  const version = $('title').text().match(/[\d.]+/)?.[0]
    || $('[data-resource-suffix]').attr('data-resource-suffix') || 'unknown'
  const fullHtml = html

  const modules = []
  const modSection = fullHtml.match(/<h2[^>]*>Modules.*?<\/h2>(.*?)<(?:h2|section)/s)
  if (!modSection) throw new Error('Could not find modules section')

  const content = modSection[1]
  const dtItems = content.matchAll(/<dt><a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a><\/dt><dd>([^<]*)<\/dd>/gs)

  for (const match of dtItems) {
    const [, href, name, desc] = match
    modules.push({
      name: name.trim(),
      url: `https://doc.rust-lang.org/std/${href}`,
      description: desc.trim(),
      status: 'stable',
    })
  }

  const grouped = {}
  for (const mod of modules) {
    const cat = categorize(mod.name)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(mod)
  }

  const categories = Object.entries(grouped).map(([name, mods]) => ({
    name,
    modules: mods,
  }))

  return {
    language: 'rust',
    label: 'Rust',
    version,
    updatedAt: new Date().toISOString(),
    categories,
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const data = await fetchRustModules()
  const outPath = resolve(DATA_DIR, 'rust.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Modules: ${data.categories.reduce((a, c) => a + c.modules.length, 0)}`)
}

main().catch(console.error)
