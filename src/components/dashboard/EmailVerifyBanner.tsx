'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function EmailVerifyBanner() {
  const [show, setShow]       = useState(false)
  const [resent, setResent]   = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.users.me().then(p => {
      if (!(p as any).emailVerified) setShow(true)
    }).catch(() => {})
  }, [])

  if (!show) return null

  const handleResend = async () => {
    setLoading(true)
    try {
      await api.auth.resendVerification()
      setResent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm bg-orange-900/30 border-b border-orange-500/20">
      <span className="text-orange-300">
        📧 Confirme seu e-mail para garantir acesso completo à plataforma.
      </span>
      <button
        onClick={handleResend}
        disabled={loading || resent}
        className="ml-4 text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20 transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {resent ? '✓ E-mail enviado' : loading ? 'Enviando...' : 'Reenviar confirmação'}
      </button>
    </div>
  )
}
