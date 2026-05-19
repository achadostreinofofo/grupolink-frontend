'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { SubscriptionStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Check, Clock, Crown, Star, Zap } from 'lucide-react'

const plans = [
  {
    key:   'SMART',
    name:  'Smart',
    price: 128,
    icon:  Zap,
    color: 'text-blue-600',
    bg:    'bg-blue-50',
    features: [
      '1 conta WhatsApp',
      '80 agendamentos/mês',
      '1 link de redirecionamento',
      'Analytics básico',
    ],
  },
  {
    key:      'DIAMOND',
    name:     'Diamond',
    price:    290,
    icon:     Star,
    color:    'text-purple-600',
    bg:       'bg-purple-50',
    highlight: true,
    features: [
      '2 contas WhatsApp',
      '4 links de redirecionamento',
      'Monitoramento entrada/saída',
      'Blacklist global',
      'Analytics avançado',
    ],
  },
  {
    key:   'BLACK',
    name:  'Black',
    price: 453,
    icon:  Crown,
    color: 'text-gray-900',
    bg:    'bg-gray-100',
    features: [
      'Contas ilimitadas',
      'Links ilimitados',
      'Acesso completo à API',
      'Encurtador próprio',
      'Suporte 24/7',
    ],
  },
]

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'green' | 'yellow' | 'gray' | 'red' }> = {
    ACTIVE:    { label: 'Ativo',    variant: 'green' },
    PENDING:   { label: 'Pendente', variant: 'yellow' },
    PAUSED:    { label: 'Pausado',  variant: 'yellow' },
    CANCELLED: { label: 'Cancelado',variant: 'red' },
    NONE:      { label: 'Gratuito', variant: 'gray' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading]   = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  useEffect(() => {
    api.subscriptions.current()
      .then(setSubscription)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planKey: string) => {
    setLoadingPlan(planKey)
    try {
      const res = await api.subscriptions.checkout(planKey)
      // Redireciona para o checkout do Mercado Pago
      window.location.href = res.checkoutUrl
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancelar sua assinatura? Você voltará para o plano gratuito.')) return
    try {
      await api.subscriptions.cancel()
      setSubscription(prev => prev ? { ...prev, status: 'CANCELLED' } : prev)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao cancelar assinatura')
    }
  }

  const currentPlan = subscription?.plan ?? 'FREE'
  const isActive    = subscription?.status === 'ACTIVE'

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plano e Assinatura</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Trial banner — shown only for FREE users */}
      {!loading && subscription?.plan === 'FREE' && (
        (() => {
          const days = subscription.trialDaysLeft ?? 0
          const expired = days === 0
          return (
            <div className={`mb-6 rounded-2xl border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
              expired
                ? 'border-red-200 bg-red-50'
                : days <= 2
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-teal-200 bg-teal-50'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                expired ? 'bg-red-100' : days <= 2 ? 'bg-amber-100' : 'bg-teal-100'
              }`}>
                {expired
                  ? <AlertTriangle className="w-5 h-5 text-red-500" />
                  : <Clock className={`w-5 h-5 ${days <= 2 ? 'text-amber-500' : 'text-teal-600'}`} />
                }
              </div>

              <div className="flex-1">
                {expired ? (
                  <>
                    <p className="font-semibold text-red-700 text-sm">Período de teste encerrado</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Seu acesso gratuito expirou. Assine um plano para continuar usando todas as funcionalidades.
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`font-semibold text-sm ${days <= 2 ? 'text-amber-700' : 'text-teal-800'}`}>
                      {days === 1 ? 'Último dia de teste gratuito!' : `${days} dias restantes no teste gratuito`}
                    </p>
                    <p className={`text-xs mt-0.5 ${days <= 2 ? 'text-amber-600' : 'text-teal-700'}`}>
                      Teste encerra em{' '}
                      {subscription.trialEndDate
                        ? new Date(subscription.trialEndDate).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })
                        : '—'
                      }. Inclui: 1 estrutura · 1 conta WhatsApp · 80 agendamentos/mês.
                    </p>
                  </>
                )}

                {/* Progress bar */}
                {!expired && (
                  <div className="mt-2 w-full max-w-xs">
                    <div className="w-full bg-white/60 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${days <= 2 ? 'bg-amber-400' : 'bg-teal-500'}`}
                        style={{ width: `${(days / 7) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{7 - days} de 7 dias utilizados</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 sm:text-right flex-shrink-0">
                Plano atual: <span className="font-semibold text-gray-700">Free Trial</span>
              </p>
            </div>
          )
        })()
      )}

      {/* Status atual — planos pagos */}
      {!loading && subscription && subscription.plan !== 'FREE' && (
        <Card className="mb-8">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Plano atual</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold text-gray-900">{currentPlan}</p>
                {statusBadge(subscription.status)}
              </div>
              {subscription.periodEndDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Próxima cobrança: {new Date(subscription.periodEndDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            {isActive && (
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Cancelar assinatura
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const Icon = plan.icon
          const isCurrent = currentPlan === plan.key
          const isLoading = loadingPlan === plan.key

          return (
            <div
              key={plan.key}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col',
                plan.highlight ? 'border-purple-300 shadow-lg shadow-purple-100' : 'border-gray-200',
                isCurrent && 'ring-2 ring-brand-500'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SEU PLANO
                  </span>
                </div>
              )}

              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', plan.bg)}>
                <Icon className={cn('w-5 h-5', plan.color)} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-gray-900">R$ {plan.price}</span>
                <span className="text-sm text-gray-400">/mês</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent && isActive}
                loading={isLoading}
                onClick={() => !isCurrent && handleSubscribe(plan.key)}
              >
                {isCurrent && isActive ? 'Plano atual' : `Assinar ${plan.name}`}
              </Button>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-center text-gray-400">
        Pagamentos processados pelo Mercado Pago. Cancele a qualquer momento.
      </p>
    </div>
  )
}
