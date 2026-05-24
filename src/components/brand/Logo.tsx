import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  /**
   * - `icon`: símbolo isolado (avatar, favicon visual). A imagem oficial é vertical,
   *   então `icon` exibe a logo inteira em tamanho reduzido.
   * - `horizontal`: dimensão otimizada para barras (Navbar / Footer / Sidebar).
   * - `vertical`: tamanho generoso para Hero / telas de Auth.
   */
  variant?: 'icon' | 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Pré-carrega a imagem; use em logos acima do dobra (Navbar / Hero). */
  priority?: boolean
  /** Mantido por compatibilidade — a logo oficial PNG já tem tons fixos. */
  tone?: 'neon' | 'mono-light' | 'mono-dark'
  /** Mantido por compatibilidade — a logo oficial PNG já tem brilho próprio. */
  glow?: boolean
}

const SIZE_PX: Record<NonNullable<LogoProps['variant']>, Record<NonNullable<LogoProps['size']>, number>> = {
  icon: {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  },
  horizontal: {
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80,
  },
  vertical: {
    sm: 80,
    md: 120,
    lg: 160,
    xl: 220,
  },
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  className,
  priority = false,
}: LogoProps) {
  const dimension = SIZE_PX[variant][size]

  return (
    <Image
      src="/logo.png"
      alt="Redirect Grupo"
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn('object-contain shrink-0 select-none', className)}
      style={{ width: dimension, height: dimension }}
    />
  )
}

/**
 * Símbolo isolado (mantido como alias do `Logo` em variante `icon`)
 * para compatibilidade com importações existentes.
 */
export function LogoSymbol({
  className,
  glow: _glow,
  tone: _tone,
  ...rest
}: Omit<LogoProps, 'variant'>) {
  return <Logo variant="icon" className={className} {...rest} />
}
