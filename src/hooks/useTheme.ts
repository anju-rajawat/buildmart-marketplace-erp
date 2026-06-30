import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'buildmart-theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(KEY) as Theme | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    setTheme,
  }
}
