'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

function VerifyEmailHandler() {
  const params = useSearchParams()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [name, setName] = useState('')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setState('error'); setErrMsg('Token não encontrado.'); return }

    api.auth.verifyEmail(token)
      .then(res => {
        // Não autenticamos automaticamente: o usuário ativa a conta e faz login em seguida.
        setName(res.name?.split(' ')?.[0] ?? '')
        setState('success')
      })
      .catch(e => {
        setState('error')
        setErrMsg(e instanceof Error ? e.message : 'Token inválido ou expirado.')
      })
  }, [params])

  if (state === 'loading') return (
    <Card><CardContent className="py-14 text-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-500">Ativando sua conta...</p>
    </CardContent></Card>
  )

  if (state === 'success') return (
    <Card><CardContent className="py-10 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Conta ativada{name ? `, ${name}` : ''}! 🎉
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Bem-vindo ao Redirect Grupo. Seu e-mail foi confirmado com sucesso.
      </p>

      {/* Benefício: 7 dias grátis no Smart, sem contratar plano */}
      <div className="text-left bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-brand-700 mb-2">
          🎁 Você ganhou 7 dias grátis no plano Smart
        </p>
        <p className="text-xs text-gray-600 mb-3">
          Sem contratar nada e sem cartão. Aproveite todos os recursos do Smart por 7 dias:
        </p>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-brand-600">✓</span> Até 2 números de WhatsApp conectados</li>
          <li className="flex items-start gap-2"><span className="text-brand-600">✓</span> Até 80 agendamentos de mensagem por mês</li>
          <li className="flex items-start gap-2"><span className="text-brand-600">✓</span> Até 20 grupos por estrutura</li>
          <li className="flex items-start gap-2"><span className="text-brand-600">✓</span> Geração de ofertas com IA</li>
        </ul>
      </div>

      <Link href="/login" className="block">
        <Button className="w-full">Fazer login e começar</Button>
      </Link>
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
