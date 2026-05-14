const features = [
  {
    icon: '🔗',
    title: 'Smart Link com Cookies',
    description: 'Um único link para toda sua estrutura. O usuário é sempre redirecionado para o mesmo grupo, evitando duplicidade de membros.',
  },
  {
    icon: '⚖️',
    title: 'Round-Robin de 3 Níveis',
    description: 'Distribui novos membros automaticamente entre grupos. Ao atingir 80% da capacidade, ativa os próximos 2 grupos simultaneamente.',
  },
  {
    icon: '📊',
    title: 'Analytics com UTM',
    description: 'Rastreie cliques por campanha, fonte e canal. Saiba exatamente qual anúncio está gerando mais membros.',
  },
  {
    icon: '🚫',
    title: 'Blacklist Global',
    description: 'Bloqueie números de curiosos e spam para que não ocupem vagas nos seus grupos de afiliados.',
  },
  {
    icon: '📅',
    title: 'Mensagens Agendadas',
    description: 'Programe envios em massa com suporte a fotos e textos de ofertas. Selecione grupos específicos ou toda a estrutura.',
  },
  {
    icon: '📤',
    title: 'Backup de Membros',
    description: 'Exporte a lista de contatos dos seus grupos em CSV a qualquer momento para backup ou migração.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para escalar
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Desenvolvido especificamente para afiliados do Mercado Livre, Amazon e Shopee que precisam
            gerenciar dezenas de grupos sem complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
