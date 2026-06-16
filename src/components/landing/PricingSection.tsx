import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Smart',
    price: 98,
    description: 'Para afiliados iniciando a automação',
    highlight: false,
    features: [
      '2 celulares conectados',
      '80 agendamentos/mês',
      '1 estrutura de grupo',
      'Analytics básico',
      'Suporte por e-mail',
    ],
    cta: 'Começar com Smart',
  },
  {
    name: 'Diamond',
    price: 179,
    description: 'Para afiliados em crescimento acelerado',
    highlight: true,
    features: [
      '4 celulares conectados',
      '400 agendamentos/mês',
      '4 estruturas de grupo',
      'Geração de ofertas com IA',
      'Monitoramento de entrada/saída dos grupos',
      'Analytics avançado',
    ],
    cta: 'Escolher Diamond',
  },
  {
    name: 'Black',
    price: 299,
    description: 'Para operações profissionais e agências',
    highlight: false,
    features: [
      '10 celulares conectados',
      '1000 agendamentos/mês',
      'Estruturas ilimitadas',
      'Geração de ofertas com IA',
      'Monitoramento de entrada/saída dos grupos',
      'Analytics avançado',
      'Suporte 24/7',
      'Onboarding dedicado',
      'Suporte prioritário',
    ],
    cta: 'Falar com vendas',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-night-800 border-t border-night-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
            Planos sem enrolação
          </h2>
          <p className="text-lg text-night-100">
            Valores até 35% abaixo da concorrência. Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-8 border transition-all',
                plan.highlight
                  ? 'bg-night-900 border-brand-500/60 shadow-neon-lg scale-105'
                  : 'bg-night-900 border-night-700 hover:border-brand-500/30'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-night-900 text-xs font-bold px-3 py-1 rounded-full shadow-neon">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn('text-lg font-bold mb-1 uppercase tracking-wide', plan.highlight ? 'text-brand-500' : 'text-white')}>
                  {plan.name}
                </h3>
                <p className="text-sm text-night-100">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  R$ {plan.price}
                </span>
                <span className="text-sm ml-1 text-night-200">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-500"
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-night-100">{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'primary' : 'secondary'}
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
