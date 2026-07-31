import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FRAMEWORKS } from './config.js'
import { fetchRepoInfo, fetchReleases, fetchAllTags } from './sources/github.js'
import { fetchRegistry } from './sources/registry.js'
import { fetchDownloads } from './sources/downloads.js'
import { stripV, pickLatest, sortVersionsDesc } from './version.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DATA_DIR = resolve(ROOT, 'data')
const FRAMEWORKS_PATH = resolve(DATA_DIR, 'frameworks.json')
const RELEASES_PATH = resolve(DATA_DIR, 'releases.json')
const CONCURRENCY = 6

function loadCache() {
  const map = {}
  try {
    const data = JSON.parse(readFileSync(FRAMEWORKS_PATH, 'utf-8'))
    for (const fw of data.frameworks) map[fw.id] = fw
  } catch {}
  try {
    const rel = JSON.parse(readFileSync(RELEASES_PATH, 'utf-8'))
    for (const entry of rel) {
      if (map[entry.id]) map[entry.id].releases = entry.releases
      else map[entry.id] = { releases: entry.releases }
    }
  } catch {}
  return map
}

function mergeBase(fw, cache) {
  const prev = cache[fw.id] || {}
  return {
    ...fw,
    description: prev.description ?? fw.description ?? null,
    homepage: prev.homepage ?? fw.homepage ?? null,
    version: prev.version ?? null,
    releaseDate: prev.releaseDate ?? null,
    stars: prev.stars ?? null,
    forks: prev.forks ?? null,
    openIssues: prev.openIssues ?? null,
    license: prev.license ?? null,
    lastCommit: prev.lastCommit ?? null,
    weeklyDownloads: prev.weeklyDownloads ?? null,
    totalDownloads: prev.totalDownloads ?? null,
    updatedAt: prev.updatedAt ?? null,
  }
}

async function crawlFramework(fw, cache) {
  const base = mergeBase(fw, cache)
  const prev = cache[fw.id] || {}
  const hasRegistry = !!(fw.package && fw.package.manager)

  let releases = prev.releases || []

  const calls = [fetchRepoInfo(fw.repo)]
  if (hasRegistry) {
    calls.push(fetchRegistry(fw.package))
    calls.push(fetchDownloads(fw.package.manager, fw.package.name))
  } else {
    calls.push(fetchAllTags(fw.repo))
    calls.push(fetchReleases(fw.repo))
  }

  const [repoRes, srcARes, srcBRes] = await Promise.allSettled(calls)
  const repo = repoRes.status === 'fulfilled' ? repoRes.value : {}
  const srcA = srcARes.status === 'fulfilled' ? srcARes.value : {}
  const srcB = srcBRes.status === 'fulfilled' ? srcBRes.value : {}

  const reg = hasRegistry ? srcA : {}
  const dl = hasRegistry ? srcB : {}
  const tags = hasRegistry ? [] : srcA
  const ghRel = hasRegistry ? [] : srcB

  const ghCandidates = tags.length > 0 ? tags : ghRel
  const ghLatest = pickLatest(ghCandidates) || pickLatest(ghRel) || null
  const version = reg.version || ghLatest?.version || base.version
  const releaseDate = reg.releaseDate
    || ghRel.find(r => r.version === version)?.date
    || null

  if (reg.releases?.length) releases = reg.releases
  else if (ghRel.length) releases = ghRel
  else if (tags.length) releases = sortVersionsDesc(tags).slice(0, 30)

  return {
    ...base,
    description: repo.description ?? reg.description ?? base.description,
    homepage: repo.homepage ?? reg.homepage ?? base.homepage,
    version: version ? stripV(version) : version,
    releaseDate: releaseDate ?? base.releaseDate,
    stars: repo.stars ?? base.stars,
    forks: repo.forks ?? base.forks,
    openIssues: repo.openIssues ?? base.openIssues,
    license: repo.license ?? reg.license ?? base.license,
    lastCommit: repo.lastCommit ?? base.lastCommit,
    weeklyDownloads: dl.weeklyDownloads ?? reg.weeklyDownloads ?? base.weeklyDownloads,
    totalDownloads: dl.totalDownloads ?? reg.totalDownloads ?? base.totalDownloads,
    updatedAt: new Date().toISOString(),
    releases: releases.slice(0, 30),
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  const cache = loadCache()

  const results = []
  let cursor = 0
  async function worker() {
    while (cursor < FRAMEWORKS.length) {
      const fw = FRAMEWORKS[cursor++]
      try {
        const data = await crawlFramework(fw, cache)
        results.push(data)
        console.log(`OK   ${fw.id.padEnd(16)} v${data.version || '—'}  ⭐${data.stars ?? '—'}  ⬇${data.weeklyDownloads ?? '—'}`)
      } catch (err) {
        console.error(`ERR  ${fw.id}: ${err.message}`)
        results.push({ ...mergeBase(fw, cache), updatedAt: null })
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  results.sort((a, b) => a.name.localeCompare(b.name))

  const frameworks = results.map(({ releases, ...rest }) => rest)
  const releasesIndex = results
    .filter(fw => fw.releases && fw.releases.length > 0)
    .map(fw => ({ id: fw.id, releases: fw.releases.slice(0, 30) }))

  writeFileSync(FRAMEWORKS_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), count: frameworks.length, frameworks }, null, 2))
  writeFileSync(RELEASES_PATH, JSON.stringify(releasesIndex, null, 2))

  const withVersion = frameworks.filter(f => f.version).length
  const withStars = frameworks.filter(f => f.stars != null).length
  console.log(`\nWrote ${FRAMEWORKS_PATH}`)
  console.log(`Frameworks: ${frameworks.length} (version: ${withVersion}, stars: ${withStars})`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
