'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuth } from '@/lib/auth'
import { LayoutDashboard, Network, Smartphone, CreditCard, BarChart2, Link2, FileText, Settings, LogOut, Radio } from 'lucide-react'

const nav = [
  { href: '/dashboard',                    label: 'Visão Geral',       icon: LayoutDashboard },
  { href: '/dashboard/structures',         label: 'Estruturas',        icon: Network },
  { href: '/dashboard/analytics',          label: 'Analytics',         icon: BarChart2 },
  { href: '/dashboard/templates',          label: 'Templates',         icon: FileText },
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
    <aside className="flex flex-col w-60 min-h-screen bg-gray-900 text-gray-300 fixed left-0 top-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5 font-bold text-white text-base">
          <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-sm">G</span>
          GrupoLink
        </div>
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
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
