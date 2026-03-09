import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (e) {
  console.warn('Firebase initialization failed. Check your .env config.', e)
  // Create a minimal app so imports don't crash.
  // Auth operations will fail at call-time with clear errors.
  app = initializeApp({ apiKey: 'dummy', projectId: 'dummy' }, 'fallback')
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app as default, auth, db }
export const googleProvider = new GoogleAuthProvider()
