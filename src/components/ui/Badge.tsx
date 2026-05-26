import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'blue'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  green:  'bg-green-900/30 text-green-400',
  yellow: 'bg-yellow-900/30 text-yellow-400',
  red:    'bg-red-900/30 text-red-400',
  gray:   'bg-night-600 text-night-200',
  blue:   'bg-blue-900/30 text-blue-400',
}

export function Badge({ variant = 'gray', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
