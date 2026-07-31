import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), '../data')

export function loadAllLanguages() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
  return files.map(f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8')))
}

export function loadLanguage(language) {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8'))
    if (data.language === language) return data
  }
  return null
}
