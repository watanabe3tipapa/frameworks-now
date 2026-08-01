export function fmtNumber(n) {
  if (n == null) return '—'
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function fmtFullNumber(n) {
  return n == null ? '—' : n.toLocaleString('en-US')
}

export function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  if (!y) return d
  return `${y}/${m}/${day}`
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const s = String(iso)
  return s.includes('T') ? s.slice(0, 10) : s
}
