import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemePreference } from '../types'

interface ThemeContextType {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('charis_theme') as ThemePreference
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved
    }
    return 'system'
  })

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const isDark = theme === 'system' ? systemIsDark : theme === 'dark'

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color for mobile browser address bars
    const metaThemeColor = document.getElementById('theme-color-meta')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#13151D' : '#F8F2E8')
    }
  }, [isDark])

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme)
    localStorage.setItem('charis_theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
