'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { OverviewAnalytics, PendingAction, Structure } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ClicksChart } from '@/components/dashboard/ClicksChart'
import { PendingActionsCard } from '@/components/dashboard/PendingActionsCard'
import { Network, Users, MousePointerClick, Plus, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [structures, setStructures]         = useState<Structure[]>([])
  const [overview, setOverview]             = useState<OverviewAnalytics | null>(null)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [loading, setLoading]               = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.structures.list(),
      api.analytics.overview(),
      api.dashboard.pendingActions(),
    ])
      .then(([st, ov, pa]) => { setStructures(st); setOverview(ov); setPendingActions(pa) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const stats = [
    { label: 'Estruturas',      value: overview?.totalStructures ?? structures.length, icon: Network,           color: 'text-brand-600 bg-brand-50' },
    { label: 'Grupos',          value: overview?.totalGroups ?? 0,                     icon: Network,           color: 'text-blue-600 bg-blue-50' },
    { label: 'Membros',         value: overview?.totalMembers ?? 0,                    icon: Users,             color: 'text-purple-600 bg-purple-50' },
    { label: 'Cliques (7d)',    value: overview?.clicksLast7Days ?? 0,                 icon: MousePointerClick, color: 'text-orange-600 bg-orange-50' },
    { label: 'Cliques Total',   value: overview?.totalClicks ?? 0,                     icon: TrendingUp,        color: 'text-night-200 bg-night-700' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-night-50">Visão Geral</h1>
          <p className="text-sm text-night-300 mt-1">Acompanhe o desempenho das suas estruturas</p>
        </div>
        <Link href="/dashboard/structures/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Estrutura
          </Button>
        </Link>
      </div>

      {/* Ações pendentes — grupos CREATING aguardando link de convite */}
      <PendingActionsCard actions={pendingActions} onActionCompleted={load} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 py-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-night-50 leading-tight">{loading ? '—' : value.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-night-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de cliques dos últimos 7 dias */}
      {overview && overview.clicksByDay.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex items-center justify-between">
            <p className="text-sm font-semibold text-night-200">Cliques — últimos 7 dias</p>
            <Link href="/dashboard/analytics" className="text-xs text-brand-600 hover:underline">Ver analytics completo →</Link>
          </CardHeader>
          <CardContent>
            <ClicksChart data={overview.clicksByDay} days={7} />
          </CardContent>
        </Card>
      )}

      {/* Estruturas recentes */}
      <div>
        <h2 className="text-base font-semibold text-night-200 mb-4">Suas Estruturas</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-night-700 animate-pulse" />
            ))}
          </div>
        ) : structures.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Network className="w-10 h-10 text-night-400 mx-auto mb-3" />
              <p className="text-night-300 text-sm mb-4">Nenhuma estrutura criada ainda</p>
              <Link href="/dashboard/structures/new">
                <Button size="sm">Criar primeira estrutura</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {structures.map(s => (
              <Link key={s.id} href={`/dashboard/structures/${s.id}`}>
                <Card className="hover:border-brand-200 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-night-50">{s.name}</p>
                      <p className="text-xs text-night-400 font-mono mt-0.5">/r/{s.slug}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-night-300">
                      <span>{s.groups.length} grupos</span>
                      <span>
                        {s.groups.reduce((a, g) => a + g.memberCount, 0).toLocaleString('pt-BR')} membros
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
