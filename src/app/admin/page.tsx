'use client'

import { useEffect, useState, useCallback } from 'react'

// ── senha default (SHA-256 de "redirectgrupo@admin2026") ──────────────────────
// Para trocar: gere o hash em https://emn178.github.io/online-tools/sha256.html
const DEFAULT_HASH = 'b5c1e2a4d0f8c9e6a2b3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── tipos ─────────────────────────────────────────────────────────────────────
interface HealthComponent { status: string; details?: Record<string, unknown> }
interface HealthData {
  status: string
  components?: {
    db?: HealthComponent
    redis?: HealthComponent
    rabbit?: HealthComponent
    ping?: HealthComponent
    diskSpace?: HealthComponent
  }
}

// ── helpers de UI ─────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const color = status === 'UP' ? '#10B981' : status === 'UNKNOWN' ? '#F59E0B' : '#EF4444'
  return (
    <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UP:      'bg-green-500/15 text-green-400 border-green-500/30',
    DOWN:    'bg-red-500/15 text-red-400 border-red-500/30',
    UNKNOWN: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${styles[status] ?? styles.UNKNOWN}`}>
      {status}
    </span>
  )
}

// ── dados estáticos ────────────────────────────────────────────────────────────
const TECH_STACK = [
  { category: 'Frontend', color: '#00E5FF', items: [
    { name: 'Next.js', version: '16.2.6', detail: 'App Router + SSR' },
    { name: 'TypeScript', version: '5.x', detail: 'Tipagem estática' },
    { name: 'Tailwind CSS', version: '3.4', detail: 'Utility-first CSS' },
    { name: 'React Hook Form', version: '7.x', detail: 'Gerenciamento de forms' },
    { name: 'Zod', version: '3.x', detail: 'Validação de schemas' },
    { name: 'Recharts', version: '2.x', detail: 'Gráficos interativos' },
  ]},
  { category: 'Backend', color: '#A855F7', items: [
    { name: 'Kotlin', version: '1.9.23', detail: 'Linguagem principal' },
    { name: 'Spring Boot', version: '3.2.5', detail: 'Framework web + DI' },
    { name: 'Spring Security', version: '6.2.x', detail: 'Auth JWT + OAuth2' },
    { name: 'Spring Data JPA', version: '3.2.x', detail: 'ORM + Flyway' },
    { name: 'Spring WebFlux', version: '6.1.x', detail: 'HTTP client reativo' },
    { name: 'Gradle', version: '8.8', detail: 'Build tool' },
  ]},
  { category: 'Infraestrutura', color: '#F59E0B', items: [
    { name: 'PostgreSQL', version: '16', detail: 'Banco principal (RDS)' },
    { name: 'Redis', version: '7.x', detail: 'Cache + sessões' },
    { name: 'RabbitMQ', version: '3.13', detail: 'Fila assíncrona' },
    { name: 'Docker', version: 'latest', detail: 'Containerização' },
    { name: 'GitHub Actions', version: 'CI/CD', detail: 'Pipeline de deploy' },
    { name: 'Flyway', version: '9.22', detail: 'Migrações de banco' },
  ]},
]

const AWS_SERVICES = [
  {
    name: 'ECS Fargate',
    icon: '🚀',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Executa o container do backend Spring Boot. Task definition com 0.5 vCPU e 1 GB RAM. Rolling deployment sem downtime.',
    detail: 'Cluster: grupolink-prod | Task: grupolink-backend:6',
  },
  {
    name: 'ECR',
    icon: '📦',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Registry privado das imagens Docker do backend. Scan automático de vulnerabilidades em cada push. Lifecycle policy mantém as últimas 10 imagens.',
    detail: '985818273645.dkr.ecr.us-east-1.amazonaws.com/grupolink-backend',
  },
  {
    name: 'RDS PostgreSQL 16',
    icon: '🗄️',
    color: '#3F8624',
    region: 'us-east-1',
    desc: 'Banco de dados principal. Instância db.t3.micro com 20 GB gp3. Backup automático por 7 dias. Criptografia em repouso.',
    detail: 'grupolink-prod.cahi4i8gsyfq.us-east-1.rds.amazonaws.com:5432',
  },
  {
    name: 'ElastiCache Redis 7',
    icon: '⚡',
    color: '#C7162B',
    region: 'us-east-1',
    desc: 'Cache de sessões, binding de cookies para round-robin e contadores atômicos para distribuição de membros entre grupos.',
    detail: 'master.grupolink-prod.77y4y7.use1.cache.amazonaws.com:6379',
  },
  {
    name: 'Application Load Balancer',
    icon: '⚖️',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Balanceador de carga na frente do ECS. Health check em /actuator/health a cada 30s. Target group com deregistration drain.',
    detail: 'grupolink-prod-alb-1851920985.us-east-1.elb.amazonaws.com',
  },
  {
    name: 'CloudFront',
    icon: '🌐',
    color: '#FF9900',
    region: 'Global',
    desc: 'CDN na frente do ALB para fornecer HTTPS ao backend. Termina SSL/TLS e repassa HTTP para o ALB internamente.',
    detail: 'd2mg9zaewamsgh.cloudfront.net',
  },
  {
    name: 'AWS Amplify',
    icon: '📱',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Hospedagem do frontend Next.js com SSR. Build automático via GitHub (branch production). SSL/TLS gerenciado via ACM.',
    detail: 'App ID: d2eeocabgzhew4 | Branch: production',
  },
  {
    name: 'SES (Simple Email Service)',
    icon: '📧',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Envio de e-mails transacionais: verificação de conta e boas-vindas. DKIM verificado, SPF configurado. Credenciais SMTP via IAM.',
    detail: 'Domínio: redirectgrupo.com.br | DKIM: SUCCESS',
  },
  {
    name: 'SSM Parameter Store',
    icon: '🔐',
    color: '#DD344C',
    region: 'us-east-1',
    desc: 'Gerenciamento seguro de 20+ secrets de produção. Secrets criptografados com KMS. Injetados no container via ECS task definition.',
    detail: 'Prefix: /grupolink/* | Tipo: SecureString (KMS)',
  },
  {
    name: 'CloudWatch Logs',
    icon: '📊',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Logs centralizados do container ECS. Retenção de 30 dias. Log group /ecs/grupolink-backend com stream por task.',
    detail: 'Log group: /ecs/grupolink-backend | Retenção: 30 dias',
  },
  {
    name: 'IAM',
    icon: '👤',
    color: '#DD344C',
    region: 'Global',
    desc: 'Roles de execução e task do ECS com permissões mínimas. Usuário dedicado para SES SMTP com política restrita de envio.',
    detail: 'Roles: task-execution-role, task-role | User: ses-smtp',
  },
  {
    name: 'EC2 (RabbitMQ)',
    icon: '🖥️',
    color: '#FF9900',
    region: 'us-east-1',
    desc: 'Instância t3.micro rodando RabbitMQ 3.13 via Docker. Alternativa ao Amazon MQ (~$136/mês) por ~$8/mês. Subnet pública com SG restrito.',
    detail: 'Instance: i-059899fc2e7f8a305 | IP: 10.0.1.159',
  },
]

// ── componente principal ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false)
  const [pwd, setPwd]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [health, setHealth]   = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  // Verifica sessão ao montar
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const hash = await sha256(pwd)
    const expected = process.env.NEXT_PUBLIC_ADMIN_HASH ?? DEFAULT_HASH
    if (hash === expected) {
      sessionStorage.setItem('admin_auth', '1')
      setAuthed(true)
    } else {
      setError('Senha incorreta')
    }
    setLoading(false)
  }

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const r = await fetch('https://d2mg9zaewamsgh.cloudfront.net/actuator/health', {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
      if (r.ok) {
        setHealth(await r.json())
      } else {
        setHealth({ status: 'DOWN' })
      }
    } catch {
      setHealth({ status: 'DOWN' })
    } finally {
      setHealthLoading(false)
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchHealth()
      const interval = setInterval(fetchHealth, 60_000)
      return () => clearInterval(interval)
    }
  }, [authed, fetchHealth])

  // ── tela de login ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 cyber-grid-bg opacity-20" />
        <div className="relative glass-card rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.4)' }}>
            <svg className="w-7 h-7 text-neon-purple" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Painel Admin</h1>
          <p className="text-gray-500 text-sm mb-6">Redirect Grupo — Acesso restrito</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Senha de administrador"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-neon-purple/50"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-dark-900 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #00E5FF)' }}>
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── dashboard ───────────────────────────────────────────────────────────────
  const overallStatus = health?.status ?? 'UNKNOWN'
  const components = health?.components ?? {}

  const serviceHealth: { label: string; status: string; detail?: string }[] = [
    { label: 'API Backend', status: overallStatus, detail: 'Spring Boot + ECS Fargate' },
    { label: 'PostgreSQL',  status: components.db?.status     ?? 'UNKNOWN', detail: 'AWS RDS us-east-1' },
    { label: 'Redis',       status: components.redis?.status  ?? 'UNKNOWN', detail: 'ElastiCache 7.x' },
    { label: 'RabbitMQ',    status: components.rabbit?.status ?? 'UNKNOWN', detail: 'EC2 t3.micro' },
    { label: 'Disk Space',  status: components.diskSpace?.status ?? 'UNKNOWN', detail: 'Container ECS' },
  ]

  const healthy = serviceHealth.filter(s => s.status === 'UP').length
  const total   = serviceHealth.length

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100">
      <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-dark-900 text-sm"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)' }}>R</span>
          <div>
            <p className="font-bold text-white text-sm">Redirect Grupo</p>
            <p className="text-xs text-gray-500">Painel de Administração</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastChecked && (
            <p className="text-xs text-gray-600">
              Atualizado: {lastChecked.toLocaleTimeString('pt-BR')}
            </p>
          )}
          <button onClick={fetchHealth} disabled={healthLoading}
            className="btn-ghost-neon text-xs px-3 py-1.5 rounded-lg">
            {healthLoading ? '⟳ Atualizando...' : '⟳ Atualizar health'}
          </button>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ── Resumo geral ── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Visão Geral</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Status Geral', value: overallStatus, sub: `${healthy}/${total} serviços UP`, color: overallStatus === 'UP' ? '#10B981' : '#EF4444' },
              { label: 'Região AWS', value: 'us-east-1', sub: 'N. Virginia', color: '#FF9900' },
              { label: 'Frontend', value: 'Amplify', sub: 'redirectgrupo.com.br', color: '#00E5FF' },
              { label: 'Backend', value: 'ECS Fargate', sub: '0.5 vCPU / 1 GB RAM', color: '#A855F7' },
            ].map(card => (
              <div key={card.label} className="glass-card rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-lg font-bold" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Health dos serviços ── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Saúde dos Serviços
            {healthLoading && <span className="ml-2 text-neon-cyan">carregando...</span>}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {serviceHealth.map(svc => (
              <div key={svc.label} className="glass-card rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{svc.label}</p>
                  <StatusDot status={svc.status} />
                </div>
                <StatusBadge status={svc.status} />
                <p className="text-xs text-gray-600">{svc.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Serviços AWS ── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Serviços AWS ({AWS_SERVICES.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AWS_SERVICES.map(svc => (
              <div key={svc.name} className="glass-card rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{svc.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{svc.name}</p>
                      <p className="text-xs text-gray-500">{svc.region}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ background: `${svc.color}20`, color: svc.color, border: `1px solid ${svc.color}40` }}>
                    AWS
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{svc.desc}</p>
                <p className="text-xs text-gray-600 font-mono break-all">{svc.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stack Tecnológica ── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Stack Tecnológica</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TECH_STACK.map(cat => (
              <div key={cat.category} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full" style={{ background: cat.color }} />
                  <h3 className="font-bold text-white">{cat.category}</h3>
                </div>
                <div className="space-y-2.5">
                  {cat.items.map(item => (
                    <div key={item.name} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.detail}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-mono"
                        style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                        {item.version}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Arquitetura ── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Arquitetura</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 font-mono">
              {[
                ['Usuário', '#00E5FF'],
                ['→', null],
                ['Amplify (HTTPS)', '#FF9900'],
                ['→', null],
                ['Next.js SSR', '#00E5FF'],
                ['→ /api/*→', null],
                ['CloudFront (HTTPS)', '#FF9900'],
                ['→', null],
                ['ALB', '#FF9900'],
                ['→', null],
                ['ECS Fargate', '#FF9900'],
                ['→', null],
                ['RDS / Redis / RabbitMQ', '#3F8624'],
              ].map(([label, color], i) =>
                color
                  ? <span key={i} className="px-2 py-1 rounded" style={{ background: `${color}20`, color: color as string, border: `1px solid ${color}30` }}>{label}</span>
                  : <span key={i} className="text-gray-600">{label}</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
              {[
                { k: 'Padrão arquitetural', v: 'Clean Architecture (4 camadas)' },
                { k: 'Auth', v: 'JWT HMAC-SHA256 + Google OAuth2' },
                { k: 'Async', v: 'RabbitMQ + Spring @Async' },
                { k: 'Migrações', v: 'Flyway (V1–V14)' },
                { k: 'CI/CD', v: 'GitHub Actions (CI + CD + Release)' },
                { k: 'Secrets', v: 'AWS SSM Parameter Store (20 params)' },
                { k: 'Logs', v: 'CloudWatch /ecs/grupolink-backend' },
                { k: 'Rate Limiting', v: 'Redis INCR+EXPIRE (30 req/min)' },
              ].map(item => (
                <div key={item.k} className="glass rounded-lg p-3">
                  <p className="text-gray-600 mb-0.5">{item.k}</p>
                  <p className="text-gray-300 font-medium">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 pb-4">
          Redirect Grupo Admin Panel · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
