const STORAGE_KEY = 'togethera_local_doc'
export const coupleDocRef = null

function readDoc() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeDoc(data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function listenCouple(onNext, onError) {
  try {
    const data = readDoc()
    const snapshot = {
      exists: () => !!data,
      data: () => data,
    }
    // emit initial
    setTimeout(() => onNext(snapshot), 0)

    // cross-tab sync
    const handler = (event) => {
      if (event.key === STORAGE_KEY) {
        const nextData = readDoc()
        const snap = {
          exists: () => !!nextData,
          data: () => nextData,
        }
        onNext(snap)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  } catch (err) {
    if (onError) onError(err)
    throw err
  }
}

export async function initCoupleDocument(seed) {
  writeDoc(seed)
}

export async function mergeCouple(updates) {
  try {
    const current = readDoc() || {}
    const next = applyUpdates(current, updates)
    writeDoc(next)
    console.info('[Togethera] Data saved', { updates })
  } catch (err) {
    console.error('[Togethera] Data save failed', err)
    throw err
  }
}

function applyUpdates(target, updates) {
  const next = structuredClone ? structuredClone(target) : JSON.parse(JSON.stringify(target))
  Object.entries(updates).forEach(([path, value]) => {
    const parts = path.split('.')
    let cursor = next
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i]
      if (cursor[key] === undefined) cursor[key] = {}
      cursor = cursor[key]
    }
    cursor[parts[parts.length - 1]] = value
  })
  return next
}
