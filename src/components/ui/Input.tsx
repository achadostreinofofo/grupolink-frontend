'use client'

import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = useState(false)
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-night-200">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={resolvedType}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-night-50 placeholder-night-400 transition',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              isPassword && 'pr-10',
              error
                ? 'border-red-500 bg-red-900/20 hover:border-red-400'
                : 'border-night-600 bg-night-600 hover:border-night-500',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-night-400 hover:text-night-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
