'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

function VerifyEmailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token de verificação não encontrado.')
      return
    }

    api.auth.verifyEmail(token)
      .then(() => {
        setStatus('success')
        // Redireciona para o dashboard após 2 segundos
        setTimeout(() => router.replace('/dashboard'), 2500)
      })
      .catch(e => {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Falha ao verificar e-mail.')
      })
  }, [params, router])

  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">Verificando seu e-mail...</h2>
          <p className="text-gray-400 text-sm">Aguarde um momento.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }}>
            <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">E-mail confirmado!</h2>
          <p className="text-gray-400 text-sm mb-6">
            Sua conta está ativa. Redirecionando para o dashboard...
          </p>
          <div className="w-full bg-dark-700 rounded-full h-1">
            <div className="h-1 rounded-full bg-neon-cyan animate-pulse" style={{ width: '60%' }} />
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Link inválido</h2>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <a href="/auth/verify-email-sent"
            className="btn-ghost-neon px-6 py-2.5 rounded-xl text-sm inline-block">
            Solicitar novo link
          </a>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
