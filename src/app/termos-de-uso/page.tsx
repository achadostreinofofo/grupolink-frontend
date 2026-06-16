import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Termos de Uso – Redirect Grupo',
  description: 'Termos e condições para uso da plataforma Redirect Grupo.',
}

export default function TermosDeUsoPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-wide">Termos de Uso</h1>
        <p className="text-sm text-night-200 mb-10">Última atualização: maio de 2026</p>

        <Section title="1. Aceitação dos termos">
          <p>
            Ao criar uma conta ou utilizar a plataforma <strong>Redirect Grupo</strong>, você declara que leu,
            compreendeu e concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize
            nossos serviços.
          </p>
          <p className="mt-2">
            Estes Termos constituem um contrato vinculante entre você (&ldquo;Usuário&rdquo;) e a{' '}
            <strong>Redirect Grupo Tecnologia Ltda.</strong> (&ldquo;Redirect Grupo&rdquo;, &ldquo;nós&rdquo; ou &ldquo;Empresa&rdquo;).
          </p>
        </Section>

        <Section title="2. Descrição do serviço">
          <p>
            O Redirect Grupo é uma plataforma SaaS que permite a afiliados e vendedores de e-commerce:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Criar e gerenciar <strong>estruturas</strong> de grupos WhatsApp com distribuição inteligente de membros (round-robin);</li>
            <li>Gerar <strong>smart links</strong> que redirecionam visitantes para grupos disponíveis automaticamente;</li>
            <li>Criar <strong>links curtos</strong> rastreáveis para campanhas de marketing;</li>
            <li>Enviar <strong>mensagens agendadas</strong> para grupos via WhatsApp Cloud API oficial;</li>
            <li>Visualizar <strong>analytics</strong> de cliques, membros, UTM e churn;</li>
            <li>Gerenciar <strong>listas de exclusão</strong> (blacklist) de contatos.</li>
          </ul>
        </Section>

        <Section title="3. Cadastro e responsabilidades da conta">
          <p>Para utilizar o Redirect Grupo você deve:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Ter no mínimo 18 anos ou ser representante legal de uma pessoa jurídica;</li>
            <li>Fornecer informações verdadeiras, precisas e atualizadas no cadastro (nome, e-mail e CPF válidos);</li>
            <li>Manter a confidencialidade de suas credenciais de acesso;</li>
            <li>Notificar imediatamente o Redirect Grupo em caso de acesso não autorizado à sua conta.</li>
          </ul>
          <p className="mt-3">
            Você é integralmente responsável por todas as atividades realizadas na sua conta. O Redirect Grupo
            não se responsabiliza por perdas decorrentes do uso indevido das suas credenciais.
          </p>
        </Section>

        <Section title="4. Planos e pagamentos">
          <p>O Redirect Grupo oferece os seguintes planos:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  {['Plano', 'Valor mensal', 'Recursos principais'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Free', 'Gratuito', 'Acesso básico, 1 estrutura, sem WhatsApp API'],
                  ['Smart', 'R$ 98,00/mês', '2 celulares, 80 agendamentos/mês, 1 estrutura, analytics básico'],
                  ['Diamond', 'R$ 179,00/mês', '4 celulares, 400 agendamentos/mês, 4 estruturas, IA, monitoramento, analytics avançado'],
                  ['Black', 'R$ 299,00/mês', '10 celulares, 1000 agendamentos/mês, estruturas ilimitadas, IA, suporte 24/7'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-gray-600 border-b border-gray-100">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc pl-5 mt-4 space-y-1">
            <li>Os pagamentos são processados de forma recorrente pelo <strong>Mercado Pago</strong>;</li>
            <li>A assinatura é renovada automaticamente a cada 30 dias;</li>
            <li>O cancelamento pode ser feito a qualquer momento no painel de configurações; o acesso permanece ativo até o fim do período pago;</li>
            <li>Não há reembolso proporcional por cancelamento antecipado, exceto nos casos previstos pelo Código de Defesa do Consumidor (CDC);</li>
            <li>Direito de arrependimento de <strong>7 dias corridos</strong> após a primeira contratação, conforme Art. 49 do CDC, com reembolso integral.</li>
          </ul>
        </Section>

        <Section title="5. Uso permitido e proibido">
          <p className="font-medium text-gray-800">É permitido:</p>
          <ul className="list-disc pl-5 mt-1 mb-4 space-y-1">
            <li>Usar a plataforma para gerenciar grupos legítimos de afiliados, vendas e comunidades;</li>
            <li>Integrar a API do WhatsApp para envio de mensagens comerciais e informativas permitidas pela Meta;</li>
            <li>Exportar seus próprios dados para uso externo.</li>
          </ul>
          <p className="font-medium text-gray-800">É expressamente proibido:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Usar o Redirect Grupo para envio de spam, mensagens fraudulentas ou conteúdo ilegal;</li>
            <li>Coletar ou usar dados de terceiros sem consentimento;</li>
            <li>Tentar comprometer a segurança, integridade ou disponibilidade da plataforma;</li>
            <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte do Redirect Grupo;</li>
            <li>Criar múltiplas contas para contornar limitações de planos;</li>
            <li>Usar a plataforma para atividades que violem as <strong>Políticas Comerciais do WhatsApp</strong> e os Termos de Serviço da Meta;</li>
            <li>Usar o serviço para promover conteúdo adulto, jogos de azar ilegais, armas ou substâncias ilícitas.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            O descumprimento dessas regras pode resultar em suspensão ou cancelamento imediato da conta, sem
            direito a reembolso.
          </p>
        </Section>

        <Section title="6. Integração com o WhatsApp">
          <p>
            O Redirect Grupo utiliza a <strong>WhatsApp Cloud API oficial da Meta</strong>. Ao conectar sua conta
            WhatsApp Business à plataforma, você concorda que:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>É responsável por cumprir as <a href="https://business.whatsapp.com/policy" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Políticas Comerciais do WhatsApp</a>;</li>
            <li>O envio de mensagens em massa deve respeitar os limites e diretrizes da Meta;</li>
            <li>O Redirect Grupo não se responsabiliza por suspensões de números ou contas WhatsApp Business impostas pela Meta por violação das políticas daquela plataforma;</li>
            <li>Você é o controlador dos dados dos membros dos seus grupos; o Redirect Grupo atua como operador de dados nessa relação.</li>
          </ul>
        </Section>

        <Section title="7. Propriedade intelectual">
          <p>
            Todo o conteúdo da plataforma Redirect Grupo — incluindo marca, logotipo, interface, código-fonte
            e documentação — é de propriedade exclusiva da Redirect Grupo Tecnologia Ltda. e protegido pela
            legislação de propriedade intelectual brasileira.
          </p>
          <p className="mt-2">
            Os dados inseridos pelo Usuário na plataforma (estruturas, grupos, templates) permanecem de
            propriedade do Usuário. Concedemos uma licença limitada, não exclusiva e revogável para uso
            da plataforma enquanto a assinatura estiver ativa.
          </p>
        </Section>

        <Section title="8. Disponibilidade e SLA">
          <p>
            Nos comprometemos a manter a plataforma disponível com <strong>99% de uptime mensal</strong>,
            exceto em casos de:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Manutenções programadas, comunicadas com 24h de antecedência;</li>
            <li>Eventos de força maior (desastres naturais, falhas de infraestrutura de terceiros);</li>
            <li>Instabilidades nas APIs da Meta ou do Mercado Pago, que estão fora do nosso controle.</li>
          </ul>
        </Section>

        <Section title="9. Limitação de responsabilidade">
          <p>
            O Redirect Grupo não se responsabiliza por:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Lucros cessantes, perda de dados ou danos indiretos decorrentes do uso da plataforma;</li>
            <li>Decisões comerciais tomadas com base em relatórios e analytics gerados pela plataforma;</li>
            <li>Interrupções causadas por falhas em APIs de terceiros (Meta, Mercado Pago, AWS);</li>
            <li>Conteúdo publicado por usuários nos grupos WhatsApp gerenciados pela plataforma.</li>
          </ul>
          <p className="mt-3">
            Nossa responsabilidade total está limitada ao valor pago pelo Usuário nos últimos 3 meses
            de assinatura.
          </p>
        </Section>

        <Section title="10. Rescisão">
          <p>
            O Redirect Grupo pode suspender ou encerrar sua conta, com ou sem aviso prévio, nos seguintes casos:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Violação destes Termos de Uso;</li>
            <li>Uso fraudulento ou atividade suspeita;</li>
            <li>Inadimplência por mais de 30 dias;</li>
            <li>Determinação judicial ou regulatória.</li>
          </ul>
          <p className="mt-3">
            O Usuário pode encerrar sua conta a qualquer momento nas configurações da plataforma. Após
            o encerramento, os dados serão retidos pelos prazos previstos na{' '}
            <a href="/politica-de-privacidade" className="text-brand-500 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </Section>

        <Section title="11. Lei aplicável e foro">
          <p>
            Estes Termos são regidos pelas leis da <strong>República Federativa do Brasil</strong>. Fica
            eleito o foro da <strong>Comarca de São Paulo/SP</strong> para resolução de conflitos, com
            renúncia a qualquer outro, por mais privilegiado que seja.
          </p>
          <p className="mt-2">
            Tentaremos resolver disputas de forma amigável antes de recorrer ao Judiciário. Para
            reclamações, entre em contato pelo e-mail{' '}
            <a href="mailto:suporte@redirectgrupo.com.br" className="text-brand-500 hover:underline">
              suporte@redirectgrupo.com.br
            </a>
            .
          </p>
        </Section>

        <Section title="12. Alterações nos termos">
          <p>
            Podemos revisar estes Termos periodicamente. Notificaremos mudanças relevantes por e-mail
            e/ou por aviso na plataforma com pelo menos <strong>10 dias de antecedência</strong>. O uso
            continuado após a vigência das alterações implica aceitação dos novos termos.
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-night-700 text-sm text-night-100 text-center">
          Dúvidas sobre estes termos?{' '}
          <a href="mailto:suporte@redirectgrupo.com.br" className="text-brand-500 hover:underline">
            suporte@redirectgrupo.com.br
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-brand-500 mb-3">{title}</h2>
      <div className="text-night-100 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
