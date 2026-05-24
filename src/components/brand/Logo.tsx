import { cn } from '@/lib/utils'
import { SVGProps } from 'react'

type Tone = 'neon' | 'mono-light' | 'mono-dark'

interface SymbolProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  tone?: Tone
  glow?: boolean
}

const TONE_COLORS: Record<Tone, { primary: string; secondary: string; accent: string }> = {
  neon:        { primary: '#00FFC8', secondary: '#1a9d82', accent: '#075E54' },
  'mono-light':{ primary: '#FFFFFF', secondary: '#FFFFFF', accent: '#FFFFFF' },
  'mono-dark': { primary: '#0F172A', secondary: '#1b2942', accent: '#075E54' },
}

/**
 * Símbolo isolado: escudo heráldico com setas de redirecionamento,
 * nós de rede e dois ícones de WhatsApp.
 * Uso: favicon, avatar, ícone de app.
 */
export function LogoSymbol({ tone = 'neon', glow = true, className, ...props }: SymbolProps) {
  const { primary, secondary, accent } = TONE_COLORS[tone]
  const gradId = `rg-grad-${tone}`
  const glowId = `rg-glow-${tone}`

  return (
    <svg
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Redirect Grupo"
      className={cn('shrink-0', className)}
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        {glow && (
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={glow ? `url(#${glowId})` : undefined}>
        {/* Escudo heráldico */}
        <path
          d="M48 6 L84 18 L84 50 C84 70 68 84 48 90 C28 84 12 70 12 50 L12 18 Z"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Linhas de rede internas */}
        <g stroke={`url(#${gradId})`} strokeWidth="1.2" opacity="0.55">
          <line x1="48" y1="22" x2="32" y2="40" />
          <line x1="48" y1="22" x2="64" y2="40" />
          <line x1="32" y1="40" x2="48" y2="58" />
          <line x1="64" y1="40" x2="48" y2="58" />
          <line x1="32" y1="40" x2="64" y2="40" />
        </g>

        {/* Nós da rede */}
        <g fill={primary}>
          <circle cx="48" cy="22" r="2.4" />
          <circle cx="32" cy="40" r="2"   />
          <circle cx="64" cy="40" r="2"   />
          <circle cx="48" cy="58" r="2.4" />
        </g>

        {/* Setas de redirecionamento (esquerda → centro → direita) */}
        <path
          d="M22 56 Q 36 66 48 60"
          fill="none"
          stroke={primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M46 58 L52 60 L48 64 Z" fill={primary} />

        <path
          d="M74 56 Q 60 66 48 60"
          fill="none"
          stroke={primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M50 58 L44 60 L48 64 Z" fill={primary} />

        {/* Ícones WhatsApp estilizados (chat bubbles) */}
        <g fill={accent} stroke={primary} strokeWidth="1.2">
          <path d="M22 38 a6 6 0 1 1 4 11 l-4 1 1 -3 a6 6 0 0 1 -1 -9 Z" />
          <path d="M74 38 a6 6 0 1 0 -4 11 l4 1 -1 -3 a6 6 0 0 0 1 -9 Z" />
        </g>

        {/* Núcleo brilhante */}
        <circle cx="48" cy="60" r="2.4" fill={primary} />
      </g>
    </svg>
  )
}

interface WordmarkProps {
  className?: string
  tone?: 'light' | 'dark' | 'neon'
  layout?: 'one-line' | 'two-lines'
}

/**
 * Tipografia "REDIRECT GRUPO" em caixa alta, sans-serif geométrica.
 */
export function LogoWordmark({ className, tone = 'light', layout = 'two-lines' }: WordmarkProps) {
  const colorClass =
    tone === 'neon' ? 'text-brand-500'
    : tone === 'dark' ? 'text-night-800'
    : 'text-white'

  if (layout === 'one-line') {
    return (
      <span
        className={cn(
          'font-display font-extrabold tracking-[0.18em] uppercase leading-none',
          colorClass,
          className,
        )}
      >
        Redirect Grupo
      </span>
    )
  }

  return (
    <span
      className={cn(
        'font-display font-extrabold tracking-[0.22em] uppercase leading-[1.05]',
        colorClass,
        className,
      )}
    >
      <span className="block">Redirect</span>
      <span className="block">Grupo</span>
    </span>
  )
}

interface LogoProps {
  variant?: 'icon' | 'horizontal' | 'vertical'
  tone?: 'neon' | 'mono-light' | 'mono-dark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  className?: string
}

const SIZE: Record<NonNullable<LogoProps['size']>, { symbol: string; word: string; gap: string }> = {
  sm: { symbol: 'w-6 h-6',   word: 'text-[10px]', gap: 'gap-2'  },
  md: { symbol: 'w-9 h-9',   word: 'text-xs',     gap: 'gap-2.5' },
  lg: { symbol: 'w-14 h-14', word: 'text-sm',     gap: 'gap-3'   },
  xl: { symbol: 'w-24 h-24', word: 'text-lg',     gap: 'gap-4'   },
}

/**
 * Logo completa com variantes.
 * - `icon`: símbolo isolado
 * - `horizontal`: símbolo + tipografia ao lado
 * - `vertical`: símbolo centralizado + tipografia abaixo
 */
export function Logo({
  variant = 'horizontal',
  tone = 'neon',
  size = 'md',
  glow = true,
  className,
}: LogoProps) {
  const dims = SIZE[size]
  const wordTone = tone === 'mono-dark' ? 'dark' : tone === 'neon' ? 'light' : 'light'

  if (variant === 'icon') {
    return <LogoSymbol tone={tone} glow={glow} className={cn(dims.symbol, className)} />
  }

  if (variant === 'vertical') {
    return (
      <div className={cn('inline-flex flex-col items-center', dims.gap, className)}>
        <LogoSymbol tone={tone} glow={glow} className={dims.symbol} />
        <LogoWordmark tone={wordTone} layout="two-lines" className={dims.word} />
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center', dims.gap, className)}>
      <LogoSymbol tone={tone} glow={glow} className={dims.symbol} />
      <LogoWordmark tone={wordTone} layout="two-lines" className={dims.word} />
    </div>
  )
}
