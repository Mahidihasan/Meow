import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { coupleDocRef, initCoupleDocument, listenCouple, mergeCouple } from '../firebase/firestore'
import { useAuth } from './AuthContext'

const defaultDoc = {
  activeProfile: 'her',
  profiles: {
    him: {
      finance: { deposits: [], expenses: [], savingsTarget: 0 },
      tasks: [],
      planners: { buy: [], date: [] },
    },
    her: {
      finance: { deposits: [], expenses: [], savingsTarget: 0 },
      tasks: [],
      planners: { buy: [], date: [] },
      period: { lastStart: '', cycleLength: 28 },
    },
  },
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [doc, setDoc] = useState(defaultDoc)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)

  // Persist doc to localStorage on change so data sticks across reloads
  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem('togethera_cache', JSON.stringify(doc))
    } catch (err) {
      console.error('[Togethera] failed to persist doc', err)
    }
  }, [doc, ready])

  useEffect(() => {
    if (!user) {
      const cached = loadCachedDoc()
      setDoc(cached || defaultDoc)
      setReady(false)
      setOffline(false)
      return
    }
    try {
      // Optimistically mark ready so UI is usable while the first snapshot loads.
      setReady(true)
      const unsub = listenCouple(
        async (snap) => {
          if (!snap.exists()) {
            await initCoupleDocument(defaultDoc)
            setDoc(defaultDoc)
            return
          }
          setDoc(snap.data())
          setOffline(false)
        },
        (err) => {
          setError(err?.message || 'Firestore unavailable')
          setReady(false)
          setOffline(true)
        },
      )
      return () => unsub()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Firebase not configured')
      setReady(false)
      setOffline(true)
      return undefined
    }
  }, [user])

  const update = async (path, value) => {
    try {
      const updates = buildUpdate(path, value)
      if (offline) {
        setDoc((prev) => applyLocalUpdate(prev, path, value))
        return
      }
      await mergeCouple(updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      setOffline(true)
      throw err
    }
  }

  const value = useMemo(
    () => ({ doc, ready, error, setError, update, offline }),
    [doc, ready, error, offline],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

function buildUpdate(path, value) {
  const update = {}
  update[path] = value
  return update
}

function loadCachedDoc() {
  try {
    const raw = window.localStorage.getItem('togethera_cache')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function applyLocalUpdate(prev, path, value) {
  const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev))
  const parts = path.split('.')
  let cursor = next
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i]
    if (cursor[key] === undefined) cursor[key] = {}
    cursor = cursor[key]
  }
  cursor[parts[parts.length - 1]] = value
  return next
}

export function useData() {
  return useContext(DataContext)
}
