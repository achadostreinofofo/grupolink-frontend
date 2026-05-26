'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Lock, Zap, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = {
  smart:   { name: 'Smart',   price: 128, key: 'SMART',   icon: Zap,   color: 'text-blue-400',   bg: 'bg-blue-900/20' },
  diamond: { name: 'Diamond', price: 290, key: 'DIAMOND', icon: Star,  color: 'text-purple-400', bg: 'bg-purple-900/20' },
  black:   { name: 'Black',   price: 453, key: 'BLACK',   icon: Crown, color: 'text-night-200',  bg: 'bg-night-600' },
} as const

const MP_FIELD_STYLE = {
  color:            '#e6e9ee',
  fontSize:         '14px',
  fontFamily:       'system-ui, -apple-system, sans-serif',
  fontWeight:       '400',
  placeholderColor: '#4b5563',
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MPInstance
  }
}

interface MPField {
  mount: (containerId: string) => void
  unmount: () => void
}

interface MPInstance {
  fields: {
    create: (type: string, options?: object) => MPField
    createCardToken: (data: {
      cardholderName: string
      identificationType: string
      identificationNumber: string
    }) => Promise<{ token: string }>
  }
}

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const fieldClass =
  'w-full rounded-lg border border-night-600 bg-night-700 px-3 py-2.5 text-sm text-night-50 placeholder-night-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition'

const iframeContainerClass =
  'w-full rounded-lg border border-night-600 bg-night-700 px-3 transition focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent'

export default function CheckoutPage() {
  const params   = useParams()
  const router   = useRouter()
  const planSlug = (params?.plan as string)?.toLowerCase() as keyof typeof PLANS
  const plan     = PLANS[planSlug]

  const [sdkReady,   setSdkReady]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [holderName, setHolderName] = useState('')
  const [cpf,        setCpf]        = useState('')
  const [email,      setEmail]      = useState('')

  const mpRef      = useRef<MPInstance | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!sdkReady || mountedRef.current || !plan) return
    mountedRef.current = true

    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' })
    mpRef.current = mp

    const cardNumber     = mp.fields.create('cardNumber',     { placeholder: '0000 0000 0000 0000', style: MP_FIELD_STYLE })
    const expirationDate = mp.fields.create('expirationDate', { placeholder: 'MM/AA',               style: MP_FIELD_STYLE })
    const securityCode   = mp.fields.create('securityCode',   { placeholder: '123',                 style: MP_FIELD_STYLE })

    cardNumber.mount('mp-cardNumber')
    expirationDate.mount('mp-expirationDate')
    securityCode.mount('mp-securityCode')

    return () => {
      cardNumber.unmount()
      expirationDate.unmount()
      securityCode.unmount()
      mountedRef.current = false
    }
  }, [sdkReady, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpRef.current) return
    setLoading(true)
    setError('')

    try {
      const { token } = await mpRef.current.fields.createCardToken({
        cardholderName:      holderName.toUpperCase(),
        identificationType:  'CPF',
        identificationNumber: cpf.replace(/\D/g, ''),
      })

      await api.subscriptions.subscribeWithToken({
        plan:                plan!.key,
        cardToken:           token,
        payerEmail:          email,
        identificationType:  'CPF',
        identificationNumber: cpf.replace(/\D/g, ''),
      })

      router.push(`/billing/success?plan=${planSlug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
      setLoading(false)
    }
  }

  if (!plan) {
    router.replace('/dashboard/billing')
    return null
  }

  const Icon    = plan.icon
  const canPay  = sdkReady && !!holderName && cpf.replace(/\D/g, '').length === 11 && !!email

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />

      <div className="min-h-screen bg-night-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-sm text-night-400 hover:text-night-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para planos
          </Link>

          <div className="bg-night-800 border border-night-600 rounded-2xl overflow-hidden">

            {/* Resumo do plano */}
            <div className="px-6 py-5 border-b border-night-600 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', plan.bg)}>
                <Icon className={cn('w-5 h-5', plan.color)} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-night-400">Assinando plano</p>
                <p className="text-base font-bold text-night-50">{plan.name} — R$ {plan.price}/mês</p>
              </div>
              <Lock className="w-4 h-4 text-night-500 flex-shrink-0" />
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-night-200 mb-1.5">
                  E-mail Mercado Pago
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className={fieldClass}
                />
              </div>

              {/* Número do cartão (iframe MP) */}
              <div>
                <label className="block text-sm font-medium text-night-200 mb-1.5">
                  Número do cartão
                </label>
                <div id="mp-cardNumber" className={iframeContainerClass} style={{ minHeight: '42px' }} />
              </div>

              {/* Validade + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-night-200 mb-1.5">
                    Validade
                  </label>
                  <div id="mp-expirationDate" className={iframeContainerClass} style={{ minHeight: '42px' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-night-200 mb-1.5">
                    CVV
                  </label>
                  <div id="mp-securityCode" className={iframeContainerClass} style={{ minHeight: '42px' }} />
                </div>
              </div>

              {/* Nome no cartão */}
              <div>
                <label className="block text-sm font-medium text-night-200 mb-1.5">
                  Nome no cartão
                </label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={e => setHolderName(e.target.value)}
                  placeholder="NOME COMO NO CARTÃO"
                  className={cn(fieldClass, 'uppercase')}
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-night-200 mb-1.5">
                  CPF do titular
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className={fieldClass}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!canPay || loading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Pagar R$ {plan.price}/mês
              </Button>

              <p className="text-xs text-night-500 text-center">
                Dados do cartão criptografados pelo Mercado Pago. Cancele a qualquer momento.
              </p>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}
