import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key])

export const firebaseReady = missingKeys.length === 0
export const firebaseError = firebaseReady
  ? ''
  : `Missing Firebase env vars: ${missingKeys.join(', ')}. Add them to your .env.local (VITE_FIREBASE_*).`

export const firebaseApp = firebaseReady ? initializeApp(firebaseConfig) : null
