import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DATA_DIR = resolve(ROOT, 'data')

const TAURI_MODULES = [
  { name: 'app', description: 'Application lifecycle and configuration', url: 'https://v2.tauri.app/reference/api/js/app/' },
  { name: 'core', description: 'Core Tauri functionality', url: 'https://v2.tauri.app/reference/api/js/core/' },
  { name: 'dpi', description: 'DPI scale and window size types', url: 'https://v2.tauri.app/reference/api/js/dpi/' },
  { name: 'event', description: 'Event system for inter-process communication', url: 'https://v2.tauri.app/reference/api/js/event/' },
  { name: 'image', description: 'Image creation and manipulation', url: 'https://v2.tauri.app/reference/api/js/image/' },
  { name: 'menu', description: 'Native menu and context menu API', url: 'https://v2.tauri.app/reference/api/js/menu/' },
  { name: 'path', description: 'Filesystem path utilities', url: 'https://v2.tauri.app/reference/api/js/path/' },
  { name: 'tray', description: 'System tray icon API', url: 'https://v2.tauri.app/reference/api/js/tray/' },
  { name: 'webview', description: 'Webview window management', url: 'https://v2.tauri.app/reference/api/js/webview/' },
  { name: 'window', description: 'Application window management', url: 'https://v2.tauri.app/reference/api/js/window/' },
  { name: 'webviewWindow', description: 'Combined webview and window creation', url: 'https://v2.tauri.app/reference/api/js/webviewWindow/' },
]

const CATEGORIES = [
  { name: 'Core', modules: ['app', 'core', 'event', 'image', 'path'] },
  { name: 'Window & Webview', modules: ['window', 'webview', 'webviewWindow', 'dpi'] },
  { name: 'Desktop', modules: ['menu', 'tray'] },
]

async function fetchTauriVersion() {
  try {
    const res = await fetch('https://registry.npmjs.org/@tauri-apps/api/latest')
    const data = await res.json()
    return data.version || 'unknown'
  } catch {
    return '2.x'
  }
}

function buildCategories(version) {
  const moduleMap = {}
  for (const mod of TAURI_MODULES) {
    moduleMap[mod.name] = mod
  }

  const categories = CATEGORIES.map(cat => ({
    name: cat.name,
    modules: cat.modules
      .filter(name => moduleMap[name])
      .map(name => ({
        name,
        url: moduleMap[name].url,
        description: moduleMap[name].description,
        status: 'stable',
      })),
  }))

  const allNames = new Set(TAURI_MODULES.map(m => m.name))
  const categorizedNames = new Set(CATEGORIES.flatMap(c => c.modules))
  const uncategorized = TAURI_MODULES.filter(m => !categorizedNames.has(m.name))

  if (uncategorized.length > 0) {
    categories.push({
      name: 'Other',
      modules: uncategorized.map(m => ({
        name: m.name,
        url: m.url,
        description: m.description,
        status: 'stable',
      })),
    })
  }

  return categories
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const version = await fetchTauriVersion()
  const data = {
    language: 'tauri',
    label: 'Tauri',
    version,
    updatedAt: new Date().toISOString(),
    categories: buildCategories(version),
  }

  const outPath = resolve(DATA_DIR, 'tauri.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Modules: ${data.categories.reduce((a, c) => a + c.modules.length, 0)}`)
}

main().catch(console.error)
