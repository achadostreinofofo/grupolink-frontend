'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { saveAuth } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

function VerifyEmailHandler() {
  const router   = useRouter()
  const params   = useSearchParams()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setState('error'); setErrMsg('Token não encontrado.'); return }

    api.auth.verifyEmail(token)
      .then(res => {
        saveAuth(res.token)
        setState('success')
        setTimeout(() => router.replace('/dashboard'), 2500)
      })
      .catch(e => {
        setState('error')
        setErrMsg(e instanceof Error ? e.message : 'Token inválido ou expirado.')
      })
  }, [params, router])

  if (state === 'loading') return (
    <Card><CardContent className="py-14 text-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-500">Verificando sua conta...</p>
    </CardContent></Card>
  )

  if (state === 'success') return (
    <Card><CardContent className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Conta ativada!</h2>
      <p className="text-sm text-gray-500 mb-6">Sua conta foi verificada com sucesso. Redirecionando...</p>
      <Button onClick={() => router.replace('/dashboard')}>Ir para o dashboard</Button>
    </CardContent></Card>
  )

  return (
    <Card><CardContent className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h2>
      <p className="text-sm text-gray-500 mb-6">{errMsg}</p>
      <Link href="/login"><Button variant="secondary">Voltar para o login</Button></Link>
    </CardContent></Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Card><CardContent className="py-14 text-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </CardContent></Card>}>
      <VerifyEmailHandler />
    </Suspense>
  )
}
