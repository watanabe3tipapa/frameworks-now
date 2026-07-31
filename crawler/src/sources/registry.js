import { stripV } from '../version.js'

const CRATES_UA = 'frameworks-now-crawler (contact: dev@example.com)'

function normalizeLicense(license) {
  if (!license) return null
  if (typeof license === 'string') return license
  if (typeof license === 'object') return license.type || null
  return null
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

function npmName(name) {
  return name.startsWith('@') ? name.replace('/', '%2f') : name
}

async function npm(pkg) {
  const data = await fetchJson(`https://registry.npmjs.org/${npmName(pkg)}`)
  const distTags = data['dist-tags'] || {}
  const version = distTags.latest || null
  const time = data.time || {}
  return {
    version,
    releaseDate: version ? (time[version] || '').slice(0, 10) || null : null,
    license: normalizeLicense(data.license || data.versions?.[version]?.license),
    description: data.description || null,
    homepage: data.homepage || null,
    releases: Object.entries(time)
      .filter(([v]) => v && !['created', 'modified'].includes(v))
      .sort((a, b) => (b[1] || '').localeCompare(a[1] || ''))
      .slice(0, 30)
      .map(([v, t]) => ({ version: v, date: t.slice(0, 10) })),
  }
}

async function pypi(pkg) {
  const data = await fetchJson(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`)
  const info = data.info || {}
  const releases = Object.entries(data.releases || {})
    .filter(([, files]) => files && files.length > 0)
    .map(([v, files]) => ({ version: v, date: (files[0].upload_time || '').slice(0, 10) }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return {
    version: info.version || null,
    releaseDate: releases[0]?.date || null,
    license: info.license || null,
    description: info.summary || null,
    homepage: info.project_urls?.Homepage || info.home_page || null,
    releases: releases.slice(0, 30),
  }
}

async function crates(name) {
  const data = await fetchJson(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, {
    'User-Agent': CRATES_UA,
  })
  const crate = data.crate || {}
  const version = crate.newest_version || crate.max_stable_version || null
  const versions = (data.versions || [])
    .filter(v => !v.yanked)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  const latest = versions[0] || {}
  return {
    version,
    releaseDate: latest.created_at ? latest.created_at.slice(0, 10) : null,
    license: crate.license || null,
    description: crate.description || null,
    homepage: crate.homepage || crate.documentation || null,
    totalDownloads: crate.downloads ?? null,
    weeklyDownloads: crate.recent_downloads ?? null,
    releases: versions.slice(0, 30).map(v => ({ version: v.num, date: v.created_at.slice(0, 10) })),
  }
}

async function gem(name) {
  const data = await fetchJson(`https://rubygems.org/api/v1/gems/${encodeURIComponent(name)}.json`)
  const versions = await fetchJson(`https://rubygems.org/api/v1/versions/${encodeURIComponent(name)}.json`)
  return {
    version: data.version || null,
    releaseDate: data.built_at ? data.built_at.slice(0, 10) : null,
    license: Array.isArray(data.licenses) ? data.licenses[0] || null : data.license || null,
    description: data.info || null,
    homepage: data.homepage_uri || data.source_code_uri || null,
    releases: versions
      .filter(v => !v.prerelease)
      .slice(0, 30)
      .map(v => ({ version: v.number, date: v.created_at ? v.created_at.slice(0, 10) : null })),
  }
}

async function packagist(name) {
  const data = await fetchJson(`https://repo.packagist.org/p2/${name}.json`)
  const versions = data.packages?.[name] || []
  const stable = versions.filter(v => !v.version.includes('dev') && !v.version.includes('-'))
  const list = (stable.length > 0 ? stable : versions).sort((a, b) => b.time.localeCompare(a.time))
  return {
    version: list[0]?.version ? stripV(list[0].version) : null,
    releaseDate: list[0]?.time?.slice(0, 10) || null,
    license: list[0]?.license?.[0] || null,
    description: list[0]?.description || null,
    homepage: list[0]?.homepage || null,
    releases: list.slice(0, 30).map(v => ({ version: stripV(v.version), date: v.time.slice(0, 10) })),
  }
}

export const REGISTRY = { npm, pypi, crates, gem, packagist }

export async function fetchRegistry({ manager, name }) {
  if (!manager || !REGISTRY[manager]) return {}
  try {
    return await REGISTRY[manager](name)
  } catch {
    return {}
  }
}
