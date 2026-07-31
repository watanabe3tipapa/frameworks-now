import { execSync } from 'node:child_process'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DATA_DIR = resolve(ROOT, 'data')

const CATEGORY_MAP = [
  { pattern: /^(archive|compress|encoding|image|mime)/i, name: 'Data Encoding & Compression' },
  { pattern: /^(bufio|bytes|fmt|io|strconv|strings|text)/i, name: 'I/O & Text Processing' },
  { pattern: /^(crypto|hash)/i, name: 'Cryptography' },
  { pattern: /^(database|embed|encoding|flag)/i, name: 'Data & Configuration' },
  { pattern: /^(go|testing|debug|runtime|reflect|regexp|sort|slices|maps)/i, name: 'Development Tools' },
  { pattern: /^(html|net|log|mime|path)/i, name: 'Web & Networking' },
  { pattern: /^(math|time|cmp|iter)/i, name: 'Math & Time' },
  { pattern: /^(os|syscall|sync|context|plugin|embed|unsafe)/i, name: 'System & OS' },
  { pattern: /^(errors|expvar|flag|fmt|log|unique)/i, name: 'Application' },
  { pattern: /^(image)/i, name: 'Graphics' },
  { pattern: /^(crypto|internal\/fips)/i, name: 'Cryptography' },
]

const INTERNAL_PREFIXES = ['internal/', 'vendor/']

function categorize(pkgName) {
  for (const entry of CATEGORY_MAP) {
    if (entry.pattern.test(pkgName)) return entry.name
  }
  const top = pkgName.split('/')[0]
  return top.charAt(0).toUpperCase() + top.slice(1)
}

async function fetchGoStdVersion() {
  try {
    const out = execSync('go version', { encoding: 'utf-8' })
    const m = out.match(/go([\d.]+)/)
    if (m) return m[1]
  } catch {}
  return 'unknown'
}

async function fetchGoPackages() {
  try {
    const out = execSync('go list std', {
      encoding: 'utf-8',
      env: { ...process.env, GOOS: 'linux', GOARCH: 'amd64', CGO_ENABLED: '0' },
    })
    return out.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

async function fetchGoModules() {
  const version = await fetchGoStdVersion()
  let packages = await fetchGoPackages()

  packages = packages.filter(p => {
    if (p.startsWith('cmd/')) return false
    if (INTERNAL_PREFIXES.some(pre => p.startsWith(pre))) return false
    if (p === 'std') return false
    if (p.startsWith('runtime/internal/')) return false
    if (p.startsWith('internal/')) return false
    return true
  })

  const grouped = {}
  for (const pkg of packages) {
    const parts = pkg.split('/')
    const topPkg = parts[0]
    let catName = categorize(pkg)

    const moduleName = pkg
    const subPath = parts.slice(1).join('/')
    const displayName = subPath || moduleName
    const url = `https://pkg.go.dev/${pkg}@go${version}`

    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push({
      name: displayName,
      url,
      description: `Package ${pkg}`,
      status: 'stable',
    })
  }

  const categories = Object.entries(grouped).map(([name, mods]) => ({
    name,
    modules: mods,
  }))

  return {
    language: 'go',
    label: 'Go',
    version,
    updatedAt: new Date().toISOString(),
    categories,
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const data = await fetchGoModules()
  const outPath = resolve(DATA_DIR, 'go.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Modules: ${data.categories.reduce((a, c) => a + c.modules.length, 0)}`)
}

main().catch(console.error)
