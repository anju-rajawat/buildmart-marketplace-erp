import {
  Box,
  BrickWall,
  Grid3x3,
  Hammer,
  Layers,
  type LucideIcon,
  Mountain,
  PaintBucket,
  Wrench,
  Zap,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  Layers,
  Hammer,
  Brick: BrickWall,
  Mountain,
  Grid3x3,
  PaintBucket,
  Wrench,
  Zap,
}

export function DynamicIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Icon = map[name] ?? Box
  return <Icon size={size} className={className} />
}
