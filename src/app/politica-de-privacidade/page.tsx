import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Política de Privacidade – Redirect Grupo',
  description: 'Como a Redirect Grupo coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
}

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-wide">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-10">Última atualização: maio de 2026</p>

        <Section title="1. Quem somos">
          <p>
            A <strong>Redirect Grupo</strong> (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo; ou &ldquo;Plataforma&rdquo;) é uma solução SaaS para gerenciamento
            de grupos WhatsApp voltada a afiliados e vendedores de e-commerce. Esta Política de Privacidade
            descreve como tratamos os dados pessoais dos usuários em conformidade com a{' '}
            <strong>Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018)</strong>.
          </p>
          <p className="mt-3">
            <strong>Controlador:</strong> Redirect Grupo Tecnologia Ltda. — contato:{' '}
            <a href="mailto:privacidade@redirectgrupo.com.br" className="text-brand-500 hover:underline">
              privacidade@redirectgrupo.com.br
            </a>
          </p>
        </Section>

        <Section title="2. Dados pessoais coletados">
          <p>Coletamos as seguintes categorias de dados:</p>
          <Table
            headers={['Dado', 'Finalidade', 'Origem']}
            rows={[
              ['Nome completo', 'Identificação e personalização', 'Cadastro'],
              ['E-mail', 'Autenticação, comunicações e notificações', 'Cadastro / Google OAuth'],
              ['CPF', 'Verificação de identidade e compliance fiscal', 'Cadastro'],
              ['Senha (hash bcrypt)', 'Autenticação segura', 'Cadastro'],
              ['Endereço IP', 'Segurança, antifraude e rate-limit', 'Automático'],
              ['Dados de navegação (cookies)', 'Rastreamento de cliques e UTM analytics', 'Automático'],
              ['Dados de grupos WhatsApp', 'Gerenciamento da plataforma', 'Integração via API'],
              ['Dados de pagamento (token Mercado Pago)', 'Processamento de assinatura', 'Mercado Pago'],
            ]}
          />
          <p className="mt-3 text-sm text-gray-600">
            Não coletamos dados sensíveis conforme definidos no Art. 5º, II da LGPD (origem racial,
            convicções religiosas, dados de saúde etc.).
          </p>
        </Section>

        <Section title="3. Base legal para o tratamento">
          <p>
            O tratamento dos seus dados está fundamentado nas seguintes bases legais previstas no{' '}
            <strong>Art. 7º da LGPD</strong>:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Execução de contrato (inciso V):</strong> dados necessários para prestar o serviço contratado.</li>
            <li><strong>Cumprimento de obrigação legal (inciso II):</strong> CPF para obrigações fiscais e compliance.</li>
            <li><strong>Legítimo interesse (inciso IX):</strong> analytics de uso, segurança e melhoria da plataforma.</li>
            <li><strong>Consentimento (inciso I):</strong> envio de comunicações de marketing, quando aplicável.</li>
          </ul>
        </Section>

        <Section title="4. Compartilhamento de dados">
          <p>Seus dados podem ser compartilhados com terceiros exclusivamente nos seguintes casos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Mercado Pago:</strong> processamento de pagamentos e assinaturas recorrentes.
            </li>
            <li>
              <strong>Meta Platforms (WhatsApp Cloud API):</strong> integração para envio e recebimento de
              mensagens via API oficial.
            </li>
            <li>
              <strong>Provedores de infraestrutura (AWS):</strong> hospedagem de servidores, banco de dados
              e armazenamento em nuvem, todos localizados no Brasil ou com garantias adequadas de transferência.
            </li>
            <li>
              <strong>Google (OAuth):</strong> somente quando você opta pelo login com Google; recebemos
              nome e e-mail da conta.
            </li>
            <li>
              <strong>Autoridades competentes:</strong> quando exigido por lei, ordem judicial ou regulatória.
            </li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Não vendemos, alugamos ou comercializamos seus dados pessoais a terceiros para fins de marketing.
          </p>
        </Section>

        <Section title="5. Retenção de dados">
          <Table
            headers={['Dado', 'Prazo de retenção']}
            rows={[
              ['Dados de conta (nome, e-mail, CPF)', 'Enquanto a conta estiver ativa + 5 anos após encerramento'],
              ['Logs de acesso e redirecionamento', '6 meses (Marco Civil da Internet, Art. 15)'],
              ['Dados de pagamento', '5 anos (obrigação fiscal)'],
              ['Cookies de rastreamento', '90 dias'],
            ]}
          />
          <p className="mt-3 text-sm text-gray-600">
            Após o prazo, os dados são anonimizados ou eliminados de forma segura.
          </p>
        </Section>

        <Section title="6. Seus direitos como titular (Art. 18 LGPD)">
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Confirmação e acesso</strong> aos seus dados tratados por nós;</li>
            <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados;</li>
            <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários;</li>
            <li><strong>Portabilidade</strong> dos seus dados a outro fornecedor de serviço;</li>
            <li><strong>Eliminação</strong> dos dados tratados com base em consentimento;</li>
            <li><strong>Revogação do consentimento</strong> a qualquer momento;</li>
            <li><strong>Informação</strong> sobre entidades públicas e privadas com quem compartilhamos dados;</li>
            <li><strong>Oposição</strong> ao tratamento com base em legítimo interesse.</li>
          </ul>
          <p className="mt-3">
            Para exercer esses direitos, acesse{' '}
            <Link href="/dashboard/settings" className="text-brand-500 hover:underline">
              Configurações
            </Link>{' '}
            ou envie um e-mail para{' '}
            <a href="mailto:privacidade@redirectgrupo.com.br" className="text-brand-500 hover:underline">
              privacidade@redirectgrupo.com.br
            </a>
            . Respondemos em até <strong>15 dias úteis</strong>.
          </p>
        </Section>

        <Section title="7. Cookies e rastreamento">
          <p>Utilizamos cookies e tecnologias similares para:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Autenticação:</strong> manter sua sessão autenticada (cookie <code className="bg-gray-100 px-1 rounded text-xs">gl_token</code>).</li>
            <li><strong>Rastreamento de afiliados:</strong> identificar de qual grupo o visitante veio, associando um <em>cookie de sessão</em> de 90 dias ao grupo WhatsApp de destino.</li>
            <li><strong>Analytics:</strong> contabilizar cliques, UTM source/medium/campaign para relatórios de desempenho.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Você pode desabilitar cookies no seu navegador, mas isso pode impactar o funcionamento da plataforma.
          </p>
        </Section>

        <Section title="8. Segurança dos dados">
          <p>Adotamos as seguintes medidas técnicas e organizacionais de segurança:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Criptografia de senhas com <strong>bcrypt</strong> (nunca armazenamos senhas em texto puro);</li>
            <li>Autenticação via <strong>JWT assinado com HMAC-SHA256</strong>, com expiração de 7 dias;</li>
            <li>Comunicação via <strong>HTTPS/TLS</strong> em todos os endpoints;</li>
            <li>Rate limiting para prevenção de ataques de força bruta;</li>
            <li>Acesso ao banco de dados restrito a serviços internos da aplicação;</li>
            <li>Backups automáticos com retenção mínima de 30 dias.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Em caso de incidente de segurança que possa acarretar risco aos titulares, notificaremos a ANPD
            e os afetados conforme exigido pelo Art. 48 da LGPD.
          </p>
        </Section>

        <Section title="9. Encarregado de Dados (DPO)">
          <p>
            Nosso Encarregado pelo Tratamento de Dados Pessoais pode ser contatado pelo e-mail{' '}
            <a href="mailto:privacidade@redirectgrupo.com.br" className="text-brand-500 hover:underline">
              privacidade@redirectgrupo.com.br
            </a>
            . Também é possível registrar reclamações junto à{' '}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:underline"
            >
              Autoridade Nacional de Proteção de Dados (ANPD)
            </a>
            .
          </p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>
            Podemos atualizar esta Política periodicamente. Comunicaremos alterações relevantes por e-mail
            ou por aviso na plataforma com antecedência mínima de 10 dias. O uso continuado dos serviços
            após a vigência das alterações implica aceitação da nova versão.
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-night-700 text-sm text-night-100 text-center">
          Dúvidas?{' '}
          <a href="mailto:privacidade@redirectgrupo.com.br" className="text-brand-500 hover:underline">
            privacidade@redirectgrupo.com.br
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

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm border border-night-700 rounded-lg overflow-hidden">
        <thead className="bg-night-900">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-4 py-2 text-left font-medium text-brand-500 border-b border-night-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-night-800' : 'bg-night-900'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-night-100 border-b border-night-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
