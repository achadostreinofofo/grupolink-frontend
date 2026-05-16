'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function VerifyEmailSentPage() {
  const [resent, setResent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleResend = async () => {
    setLoading(true)
    setError('')
    try {
      await api.auth.resendVerification()
      setResent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reenviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      {/* Ícone */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(0,229,255,0.3)' }}>
        <svg className="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Confirme seu e-mail</h1>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        Enviamos um link de confirmação para o seu e-mail.<br />
        Clique no link para ativar sua conta e começar o período de teste gratuito.
      </p>

      <div className="glass rounded-xl p-4 mb-6 text-left">
        <p className="text-xs text-gray-500 mb-1">Não recebeu o e-mail?</p>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Verifique a pasta de spam</li>
          <li>O link expira em 24 horas</li>
          <li>Pode levar alguns minutos para chegar</li>
        </ul>
      </div>

      {resent ? (
        <p className="text-sm text-neon-cyan">✓ E-mail reenviado com sucesso!</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={loading}
          className="btn-ghost-neon px-6 py-2.5 rounded-xl text-sm w-full"
        >
          {loading ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
        </button>
      )}

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <p className="mt-6 text-xs text-gray-600">
        <a href="/login" className="text-neon-cyan hover:underline">← Voltar para o login</a>
      </p>
    </div>
  )
}
