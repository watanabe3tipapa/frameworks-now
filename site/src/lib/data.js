import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), '../data')

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf-8'))
}

export function loadFrameworks() {
  return readJson('frameworks.json')
}

export function loadReleases() {
  return readJson('releases.json')
}
