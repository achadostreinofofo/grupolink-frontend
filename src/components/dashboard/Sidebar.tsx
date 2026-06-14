'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth } from '@/lib/auth'
import { Logo } from '@/components/brand/Logo'
import { LayoutDashboard, Network, Smartphone, CreditCard, BarChart2, Link2, FileText, Settings, LogOut, Radio } from 'lucide-react'

const nav = [
  { href: '/dashboard',                    label: 'Visão Geral',       icon: LayoutDashboard },
  { href: '/dashboard/structures',         label: 'Estruturas',        icon: Network },
  { href: '/dashboard/analytics',          label: 'Analytics',         icon: BarChart2 },
  // { href: '/dashboard/templates',          label: 'Templates',         icon: FileText },   // MVP: desabilitado
  { href: '/dashboard/links',              label: 'Links',             icon: Link2 },
  { href: '/dashboard/integrations',       label: 'WhatsApp',          icon: Smartphone },
  { href: '/dashboard/monitored-groups',   label: 'Grupos Monitorados',icon: Radio },
  { href: '/dashboard/billing',            label: 'Plano',             icon: CreditCard },
  { href: '/dashboard/settings',           label: 'Configurações',     icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-night-900 text-night-100 fixed left-0 top-0 border-r border-night-700">
      <div className="px-5 py-5 border-b border-night-700">
        <Link href="/dashboard" aria-label="Redirect Grupo">
          <Logo variant="horizontal" size="md" priority />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30 shadow-neon'
                  : 'text-night-100 hover:bg-night-700 hover:text-brand-500'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-night-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-night-100 hover:bg-night-700 hover:text-brand-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
