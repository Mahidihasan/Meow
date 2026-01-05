import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USERS = {
  maha: { name: 'maha', pass: 'loveyoumeow' },
  momo: { name: 'momo', pass: 'loveyoumeow' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = loadSession()
    if (cached) {
      setUser(cached)
    }
    setLoading(false)
  }, [])

  const signIn = async (username, password) => {
    const key = username?.toLowerCase()
    const entry = USERS[key]
    if (!entry || entry.pass !== password) {
      throw new Error('Invalid username or password')
    }
    const payload = { email: `${entry.name}@togethera.local`, displayName: entry.name }
    setUser(payload)
    saveSession(payload)
  }

  const signOut = async () => {
    setUser(null)
    clearSession()
  }

  const value = {
    user,
    loading,
    authMissing: false,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

function saveSession(user) {
  try {
    window.localStorage.setItem('togethera_user', JSON.stringify(user))
  } catch (err) {
    console.error('[Togethera] failed to persist session', err)
  }
}

function loadSession() {
  try {
    const raw = window.localStorage.getItem('togethera_user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem('togethera_user')
  } catch (err) {
    console.error('[Togethera] failed to clear session', err)
  }
}
