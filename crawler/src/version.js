export function stripV(v) {
  return v ? String(v).replace(/^v/, '') : v
}

export function parseSemver(v) {
  const s = stripV(v)
  const m = s.match(/^(\d+)\.(\d+)(?:\.(\d+))?/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)]
}

export function isStable(v) {
  return v ? !stripV(v).includes('-') : false
}

function compare(a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (!pa && !pb) return 0
  if (!pa) return 1
  if (!pb) return -1
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

export function sortVersionsDesc(list) {
  return list
    .filter(r => parseSemver(r.version))
    .sort((a, b) => compare(b.version, a.version) || (b.date || '').localeCompare(a.date || ''))
}

export function pickLatest(list) {
  if (!list || list.length === 0) return null
  const stable = list.filter(r => isStable(r.version))
  const pool = stable.length > 0 ? stable : list
  return sortVersionsDesc(pool)[0] || null
}
