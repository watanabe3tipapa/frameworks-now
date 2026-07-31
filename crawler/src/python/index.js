import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DATA_DIR = resolve(ROOT, 'data')
const PYTHON_URL = 'https://docs.python.org/3/py-modindex.html'

const CATEGORY_MAP = [
  { pattern: /^(string|re|difflib|textwrap|unicodedata|stringprep)/i, name: 'Text Processing' },
  { pattern: /^(datetime|calendar|collections|enum|array|heapq|bisect|weakref|types|copy|pprint|reprlib|abc|annotationlib|dataclasses|contextvars|graphlib)/i, name: 'Data Types' },
  { pattern: /^(math|cmath|decimal|fractions|random|statistics|numbers)/i, name: 'Math & Statistics' },
  { pattern: /^(itertools|functools|operator|contextlib)/i, name: 'Functional Programming' },
  { pattern: /^(os|os_path|pathlib|shutil|tempfile|fileinput|fnmatch|glob|linecache|io|mmap|filecmp)/i, name: 'File System' },
  { pattern: /^(json|csv|configparser|tomllib|xml|html|sgmllib|plistlib)/i, name: 'Data Serialization' },
  { pattern: /^(argparse|getopt|logging|gettext|locale|netrc|shlex|optparse)/i, name: 'Application Interface' },
  { pattern: /^(re|typing|pydoc|doctest|unittest|test|trace|profile|pstats|timeit|benchmark|cmd|code|codeop|rlcompleter|tabnanny|pyclbr|cProfile|idlelib)/i, name: 'Development & Testing' },
  { pattern: /^(sys|sysconfig|platform|builtins|atexit|site|__future__|gc|errno|stat|posix)/i, name: 'Python Runtime' },
  { pattern: /^(subprocess|threading|multiprocessing|concurrent|asyncio|asyncore|asynchat|select|selectors|queue|sched)/i, name: 'Concurrency' },
  { pattern: /^(socket|ssl|http|urllib|requests|ftplib|poplib|imaplib|smtplib|smtpd|telnetlib|nntplib|uuid|socketserver|xmlrpc|ipaddress)/i, name: 'Networking' },
  { pattern: /^(email|mailbox|mime|base64|binascii|quopri|uu)/i, name: 'Email & Encoding' },
  { pattern: /^(hashlib|hmac|secrets|shutil|base64)/i, name: 'Cryptography' },
  { pattern: /^(colorsys|tkinter|turtle|curses|wave|aifc|audioop|sndhdr|sunau|getpass|winsound)/i, name: 'Multimedia & GUI' },
  { pattern: /^(webbrowser|cgi|wsgiref|http|cookie|cookielib|shelve|dbm|sqlite3|bz2|gzip|zipfile|tarfile|lzma|zlib|zstandard|compression)/i, name: 'Data Storage' },
  { pattern: /^(compileall|py_compile|zipimport|pkgutil|modulefinder|runpy|importlib|imp|pkgutil|zipapp)/i, name: 'Module System' },
  { pattern: /^(inspect|ast|symtable|token|keyword|parser|dis|pickle|pickletools|marshal|shelve)/i, name: 'Code Introspection' },
  { pattern: /^(ctypes|fcntl|pty|termios|tty|pwd|grp|struct|msvcrt|winreg|winsound)/i, name: 'System Interface' },
  { pattern: /^(signal|warnings|traceback|faulthandler|cgitb|pdb|bdb)/i, name: 'Debugging & Error' },
  { pattern: /^(io|sys|print|input|codecs|encodings|gettext|locale)/i, name: 'I/O & Encoding' },
  { pattern: /^(time|datetime|calendar|zoneinfo)/i, name: 'Time' },
  { pattern: /^(venv|ensurepip|distutils|sysconfig|site|__main__)/i, name: 'Distribution & Packaging' },
]

const PRIVATE_MODULES = /^_/

function categorize(moduleName) {
  for (const entry of CATEGORY_MAP) {
    if (entry.pattern.test(moduleName)) return entry.name
  }
  return 'Other'
}

async function fetchPythonModules() {
  const res = await fetch(PYTHON_URL)
  const html = await res.text()
  const $ = cheerio.load(html)

  const version = $('title').text().match(/Python ([\d.]+)/)?.[1] || 'unknown'

  const modules = []

  $('table.indextable.modindextable tr').each((_, row) => {
    const $row = $(row)
    if ($row.hasClass('pcap') || $row.hasClass('cap')) return

    const $link = $row.find('a[href*="library/"]')
    if (!$link.length) return

    const href = $link.attr('href') || ''
    const moduleName = href.match(/library\/([^#]+)/)?.[1] || ''
    const fullName = $link.find('code').text().trim()

    if (PRIVATE_MODULES.test(fullName)) return

    const descEl = $row.find('em')
    const desc = descEl.length ? descEl.text().trim() : ''
    const isRemoved = /removed in/i.test(desc)
    const isDeprecated = /deprecated/i.test(desc)

    modules.push({
      name: fullName,
      url: `https://docs.python.org/3/${href}`,
      description: desc,
      status: isRemoved ? 'deprecated' : isDeprecated ? 'deprecated' : 'stable',
    })
  })

  const grouped = {}
  for (const mod of modules) {
    const cat = categorize(mod.name)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(mod)
  }

  const categories = Object.entries(grouped).map(([name, mods]) => ({
    name,
    modules: mods,
  }))

  return {
    language: 'python',
    label: 'Python',
    version,
    updatedAt: new Date().toISOString(),
    categories,
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const data = await fetchPythonModules()
  const outPath = resolve(DATA_DIR, 'python.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Modules: ${data.categories.reduce((a, c) => a + c.modules.length, 0)}`)
}

main().catch(console.error)
