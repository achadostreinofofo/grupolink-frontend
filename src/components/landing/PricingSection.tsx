import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Smart',
    price: 128,
    description: 'Para afiliados iniciando a automação',
    highlight: false,
    features: [
      '1 celular conectado',
      '80 agendamentos/mês',
      '1 link de redirecionamento',
      'Analytics básico',
      'Suporte por e-mail',
    ],
    cta: 'Começar com Smart',
  },
  {
    name: 'Diamond',
    price: 290,
    description: 'Para afiliados em crescimento acelerado',
    highlight: true,
    features: [
      '2 celulares conectados',
      '4 links de redirecionamento',
      'Monitoramento de entrada/saída',
      'Blacklist global',
      'Analytics avançado',
      'Suporte prioritário',
    ],
    cta: 'Escolher Diamond',
  },
  {
    name: 'Black',
    price: 453,
    description: 'Para operações profissionais e agências',
    highlight: false,
    features: [
      'Acesso completo à API',
      'Criação ilimitada de grupos',
      'Celulares ilimitados',
      'Links ilimitados',
      'Encurtador próprio',
      'Suporte 24/7',
      'Onboarding dedicado',
    ],
    cta: 'Falar com vendas',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Planos sem enrolação
          </h2>
          <p className="text-lg text-gray-500">
            Valores até 35% abaixo da concorrência. Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-8 border',
                plan.highlight
                  ? 'bg-brand-600 border-brand-600 text-white shadow-2xl shadow-brand-200 scale-105'
                  : 'bg-white border-gray-200'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn('text-lg font-bold mb-1', plan.highlight ? 'text-white' : 'text-gray-900')}>
                  {plan.name}
                </h3>
                <p className={cn('text-sm', plan.highlight ? 'text-brand-100' : 'text-gray-500')}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className={cn('text-4xl font-extrabold', plan.highlight ? 'text-white' : 'text-gray-900')}>
                  R$ {plan.price}
                </span>
                <span className={cn('text-sm ml-1', plan.highlight ? 'text-brand-100' : 'text-gray-400')}>/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg
                      className={cn('w-4 h-4 mt-0.5 flex-shrink-0', plan.highlight ? 'text-brand-200' : 'text-brand-600')}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlight ? 'text-brand-50' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'secondary' : 'primary'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
