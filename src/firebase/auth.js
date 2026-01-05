import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { firebaseApp, firebaseError, firebaseReady } from './firebase'

const auth = firebaseReady && firebaseApp ? getAuth(firebaseApp) : null
const provider = firebaseReady ? new GoogleAuthProvider() : null

export async function signInWithGoogle() {
  if (!auth || !provider) {
    throw new Error(firebaseError || 'Firebase is not configured')
  }
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (err) {
    const code = err?.code || ''
    console.error('Google sign-in failed', code, err)
    if (code === 'auth/unauthorized-domain') {
      throw new Error('Add localhost to Firebase Authorized Domains')
    }
    if (code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Allow popups and try again.')
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
      throw new Error('Enable Google sign-in in Firebase console (Authentication > Sign-in method).')
    }
    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Popup closed before completing sign-in. Please try again.')
    }
    throw err instanceof Error ? err : new Error('Sign-in failed')
  }
}

export async function signOut() {
  if (!auth) return
  await fbSignOut(auth)
}

export { auth }
