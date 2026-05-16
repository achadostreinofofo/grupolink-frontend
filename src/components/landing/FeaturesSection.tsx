const features = [
  {
    icon: '⚡',
    title: 'Smart Link com Cookies',
    description: 'Um único link para toda sua estrutura. O visitante sempre retorna ao mesmo grupo, sem duplicidade de membros.',
    accent: 'neon-cyan',
  },
  {
    icon: '🔄',
    title: 'Round-Robin de 3 Níveis',
    description: 'Distribui novos membros automaticamente. Ao atingir 80% da capacidade, ativa os próximos 2 grupos simultaneamente.',
    accent: 'neon-purple',
  },
  {
    icon: '📊',
    title: 'Analytics com UTM',
    description: 'Rastreie cliques por campanha, fonte e canal. Saiba exatamente qual anúncio está gerando mais membros.',
    accent: 'neon-cyan',
  },
  {
    icon: '🛡️',
    title: 'Blacklist Global',
    description: 'Bloqueie números de curiosos e spam para que não ocupem vagas nos seus grupos de afiliados.',
    accent: 'neon-purple',
  },
  {
    icon: '🚀',
    title: 'Mensagens Agendadas',
    description: 'Programe envios em massa com fotos e textos. Selecione grupos específicos ou toda a estrutura de uma vez.',
    accent: 'neon-cyan',
  },
  {
    icon: '💾',
    title: 'Backup de Membros',
    description: 'Exporte a lista de contatos dos seus grupos em CSV a qualquer momento para backup ou migração.',
    accent: 'neon-purple',
  },
]

const accentColors: Record<string, string> = {
  'neon-cyan':   '#00E5FF',
  'neon-purple': '#A855F7',
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-neon-cyan text-sm font-semibold tracking-widest uppercase mb-3">Funcionalidades</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">escalar</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Desenvolvido para afiliados do Mercado Livre, Amazon e Shopee que precisam
            gerenciar dezenas de grupos sem complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const color = accentColors[f.accent]
            return (
              <div key={f.title} className="glass-card rounded-2xl p-6 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
