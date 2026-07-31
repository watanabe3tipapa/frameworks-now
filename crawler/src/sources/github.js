import { execSync } from 'node:child_process'
import { stripV, isStable } from '../version.js'

const API = 'https://api.github.com'
const UA = 'frameworks-now-crawler'

let cachedToken = null

async function getToken() {
  if (cachedToken !== null) return cachedToken
  if (process.env.GITHUB_TOKEN) {
    cachedToken = process.env.GITHUB_TOKEN
    return cachedToken
  }
  try {
    cachedToken = execSync('gh auth token', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 10000,
    }).trim()
  } catch {
    cachedToken = ''
  }
  return cachedToken || null
}

export async function ghGet(path) {
  const headers = { 'User-Agent': UA, Accept: 'application/vnd.github+json' }
  const token = await getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`)
  return res.json()
}

export async function fetchRepoInfo(repo) {
  const data = await ghGet(`/repos/${repo}`)
  return {
    stars: data.stargazers_count ?? null,
    forks: data.forks_count ?? null,
    openIssues: data.open_issues_count ?? null,
    license: data.license?.spdx_id || null,
    lastCommit: data.pushed_at ? data.pushed_at.slice(0, 10) : null,
    description: data.description || null,
    homepage: data.homepage || null,
    defaultBranch: data.default_branch || 'main',
  }
}

export async function fetchReleases(repo, limit = 30) {
  try {
    const releases = await ghGet(`/repos/${repo}/releases?per_page=${limit}`)
    return releases
      .map(r => ({
        version: stripV(r.tag_name),
        date: (r.published_at || r.created_at || '').slice(0, 10) || null,
        prerelease: !!r.prerelease,
      }))
      .filter(r => r.version)
  } catch {
    return []
  }
}

export async function fetchAllTags(repo) {
  try {
    const out = execSync(`git ls-remote --tags https://github.com/${repo}.git`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const tags = new Set()
    for (const line of out.split('\n')) {
      const m = line.match(/refs\/tags\/(.+?)(?:\^\{\})?$/)
      if (m) tags.add(m[1])
    }
    return [...tags]
      .map(t => ({ version: stripV(t), date: null, prerelease: !isStable(t) }))
      .filter(t => t.version)
  } catch {
    return []
  }
}
