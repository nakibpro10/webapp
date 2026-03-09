/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      )
      await signInWithEmailAndPassword(auth, email, password)
    },
    []
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await updateProfile(credential.user, { displayName: name })
    },
    []
  )

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
