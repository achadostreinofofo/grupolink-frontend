'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Lock, Zap, Star, Crown, Check, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = {
  smart: {
    name: 'Smart', price: 98, key: 'SMART', icon: Zap,
    color: 'text-blue-400', bg: 'bg-blue-900/20',
    description: 'Para afiliados iniciando a automação',
    features: ['2 celulares conectados', '80 agendamentos/mês', '1 estrutura de grupo', 'Analytics básico', 'Suporte por e-mail'],
  },
  diamond: {
    name: 'Diamond', price: 179, key: 'DIAMOND', icon: Star,
    color: 'text-purple-400', bg: 'bg-purple-900/20',
    description: 'Para afiliados em crescimento acelerado',
    features: ['4 celulares conectados', '400 agendamentos/mês', '4 estruturas de grupo', 'Geração de ofertas com IA', 'Monitoramento de entrada/saída', 'Analytics avançado'],
  },
  black: {
    name: 'Black', price: 299, key: 'BLACK', icon: Crown,
    color: 'text-night-200', bg: 'bg-night-600',
    description: 'Para operações profissionais e agências',
    features: ['10 celulares conectados', '1000 agendamentos/mês', 'Estruturas ilimitadas', 'Geração de ofertas com IA', 'Monitoramento de entrada/saída', 'Suporte prioritário 24/7'],
  },
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
  'w-full rounded-lg border border-night-600 bg-night-700 overflow-hidden transition focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent'

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
        <div className="w-full max-w-4xl">

          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-sm text-night-400 hover:text-night-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para planos
          </Link>

          <div className="grid md:grid-cols-2 bg-night-800 border border-night-600 rounded-2xl overflow-hidden shadow-2xl">

            {/* ── Coluna esquerda: resumo do plano e valor ── */}
            <aside className="relative bg-gradient-to-b from-night-800 to-night-900 p-6 md:p-8 border-b md:border-b-0 md:border-r border-night-600">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', plan.bg)}>
                  <Icon className={cn('w-6 h-6', plan.color)} />
                </div>
                <div>
                  <p className="text-xs text-night-400">Você está assinando</p>
                  <p className="text-lg font-bold text-night-50">Plano {plan.name}</p>
                </div>
              </div>

              <p className="text-sm text-night-300 mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-night-50">R$ {plan.price}</span>
                <span className="text-sm text-night-400">/mês</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-night-200">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brand-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-xs text-night-400 border-t border-night-700 pt-4">
                <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
                Pagamento seguro via Mercado Pago · Cancele quando quiser
              </div>
            </aside>

            {/* ── Coluna direita: formulário de pagamento ── */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-brand-400" />
                <h1 className="text-base font-semibold text-night-50">Dados de pagamento</h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

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
                  <div id="mp-cardNumber" className={iframeContainerClass} style={{ height: '42px' }} />
                </div>

                {/* Validade + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-night-200 mb-1.5">
                      Validade
                    </label>
                    <div id="mp-expirationDate" className={iframeContainerClass} style={{ height: '42px' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-night-200 mb-1.5">
                      CVV
                    </label>
                    <div id="mp-securityCode" className={iframeContainerClass} style={{ height: '42px' }} />
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
      </div>
    </>
  )
}
