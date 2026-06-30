import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )
}
