'use client'

import Link from 'next/link'

const plans = [
  {
    name: 'Smart',
    price: 128,
    description: 'Para afiliados iniciando a automação',
    highlight: false,
    accent: '#00E5FF',
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
    accent: '#A855F7',
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
    accent: '#00E5FF',
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
    <section id="pricing" className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, #00E5FF, transparent)' }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-neon-cyan text-sm font-semibold tracking-widest uppercase mb-3">Preços</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Planos <span className="gradient-text">sem enrolação</span>
          </h2>
          <p className="text-gray-400">Valores até 35% abaixo da concorrência. Cancele quando quiser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-8 transition-all ${
              plan.highlight ? 'scale-105' : ''
            }`}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,229,255,0.08))'
                  : 'rgba(22,27,34,0.8)',
                border: plan.highlight
                  ? '1px solid rgba(168,85,247,0.5)'
                  : '1px solid rgba(0,229,255,0.08)',
                boxShadow: plan.highlight ? '0 0 40px rgba(168,85,247,0.15)' : 'none',
              }}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)', color: '#04070f' }}>
                    MAIS POPULAR
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-end gap-1">
                <span className="text-4xl font-extrabold"
                  style={{ color: plan.accent }}>
                  R$ {plan.price}
                </span>
                <span className="text-sm text-gray-500 mb-1">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: plan.accent }}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <button className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={plan.highlight ? {
                    background: 'linear-gradient(135deg, #A855F7, #00E5FF)',
                    color: '#04070f',
                    fontWeight: 700,
                  } : {
                    background: 'transparent',
                    border: `1px solid ${plan.accent}40`,
                    color: plan.accent,
                  }}
                  onMouseEnter={e => {
                    if (!plan.highlight) {
                      (e.target as HTMLButtonElement).style.background = `${plan.accent}15`
                    }
                  }}
                  onMouseLeave={e => {
                    if (!plan.highlight) {
                      (e.target as HTMLButtonElement).style.background = 'transparent'
                    }
                  }}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
