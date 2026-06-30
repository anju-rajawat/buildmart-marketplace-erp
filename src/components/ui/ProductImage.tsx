import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Image with graceful offline fallback (placeholder URLs may fail without network). */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-900',
          className,
        )}
      >
        <ImageOff size={28} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
