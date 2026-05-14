'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get('plan') ?? ''

  useEffect(() => {
    // Aguarda 5s e redireciona para o dashboard
    const t = setTimeout(() => router.push('/dashboard/billing'), 5000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assinatura confirmada!</h1>
        <p className="text-gray-500 mb-2">
          {plan ? (
            <>Seu plano <strong className="capitalize">{plan}</strong> está sendo ativado.</>
          ) : (
            'Seu pagamento foi confirmado.'
          )}
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Você será redirecionado automaticamente em alguns segundos.
        </p>
        <Link href="/dashboard/billing">
          <Button className="w-full">Ir para o dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
