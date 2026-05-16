'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

function daysLeft(endsAt: string): number {
  const diff = new Date(endsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function TrialBanner() {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    api.users.me().then(p => {
      if (p.isOnTrial && p.trialEndsAt) {
        setDays(daysLeft(p.trialEndsAt))
      }
    }).catch(() => {})
  }, [])

  if (days === null) return null

  const urgent = days <= 2

  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${
      urgent
        ? 'bg-red-900/40 border-b border-red-500/30 text-red-300'
        : 'bg-yellow-900/30 border-b border-yellow-500/20 text-yellow-300'
    }`}>
      <span>
        {urgent
          ? `⚠️ Seu período de avaliação expira em ${days} dia${days !== 1 ? 's' : ''}. Após isso, suas estruturas serão removidas.`
          : `✦ Período de avaliação gratuita — ${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`
        }
      </span>
      <Link href="/dashboard/billing"
        className="ml-4 text-xs font-semibold px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-colors whitespace-nowrap">
        Assinar agora
      </Link>
    </div>
  )
}
