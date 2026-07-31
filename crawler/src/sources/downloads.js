async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

function npmName(name) {
  return name.startsWith('@') ? name.replace('/', '%2f') : name
}

async function npm(pkg) {
  const data = await fetchJson(`https://api.npmjs.org/downloads/point/last-week/${npmName(pkg)}`)
  return { weeklyDownloads: data.downloads ?? null }
}

async function pypi(pkg) {
  const data = await fetchJson(`https://pypistats.org/api/packages/${encodeURIComponent(pkg)}/recent`)
  return { weeklyDownloads: data.data?.last_week ?? null }
}

export async function fetchDownloads(manager, name) {
  if (!manager || !name) return {}
  try {
    if (manager === 'npm') return await npm(name)
    if (manager === 'pypi') return await pypi(name)
  } catch {}
  return {}
}
