/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type Language = 'en' | 'bn'

interface LanguageContextValue {
  language: Language
  toggleLanguage: () => void
  setLanguage: (lang: Language) => void
}

const STORAGE_KEY = 'nakib-cloud-lang'

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved === 'bn' ? 'bn' : 'en') as Language
  })

  const applyLanguage = useCallback((lang: Language) => {
    document.documentElement.setAttribute('data-lang', lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  useEffect(() => {
    applyLanguage(language)
  }, [language, applyLanguage])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'bn' : 'en'))
  }, [])

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
