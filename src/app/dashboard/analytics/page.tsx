'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { api } from '@/lib/api'
import type { ChurnAnalytics, OverviewAnalytics, Structure, StructureAnalytics, UtmAnalytics } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ClicksChart } from '@/components/dashboard/ClicksChart'
import { ChurnChart } from '@/components/dashboard/ChurnChart'
import { UtmTable } from '@/components/dashboard/UtmTable'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, Users, MousePointerClick, Network } from 'lucide-react'

function CapacityBar({ pct }: { pct: number }) {
  const p = Math.min(pct * 100, 100)
  const color = p >= 90 ? 'bg-red-500' : p >= 80 ? 'bg-yellow-400' : 'bg-brand-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${p}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-9 text-right">{Math.round(p)}%</span>
    </div>
  )
}

function AnalyticsContent() {
  const params = useSearchParams()
  const structureId = params.get('structure')

  const [overview, setOverview] = useState<OverviewAnalytics | null>(null)
  const [detail, setDetail]     = useState<StructureAnalytics | null>(null)
  const [structures, setStructures] = useState<Structure[]>([])
  const [days, setDays] = useState<7 | 30>(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.analytics.overview(),
      api.structures.list(),
      structureId ? api.analytics.structure(structureId) : Promise.resolve(null),
    ])
      .then(([ov, st, det]) => { setOverview(ov); setStructures(st); setDetail(det) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [structureId])

  const stats = overview ? [
    { label: 'Estruturas',       value: overview.totalStructures,             icon: Network,          color: 'text-brand-600 bg-brand-50' },
    { label: 'Grupos',           value: overview.totalGroups,                 icon: Network,          color: 'text-blue-600 bg-blue-50' },
    { label: 'Membros Totais',   value: overview.totalMembers,                icon: Users,            color: 'text-purple-600 bg-purple-50' },
    { label: 'Cliques (7 dias)', value: overview.clicksLast7Days,             icon: MousePointerClick, color: 'text-orange-600 bg-orange-50' },
    { label: 'Cliques Total',    value: overview.totalClicks,                 icon: TrendingUp,        color: 'text-gray-600 bg-gray-50' },
  ] : []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Cliques, membros e desempenho das suas estruturas</p>
        </div>
        <div className="flex gap-2">
          {([7, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats gerais */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{value.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráfico overview */}
      {overview && (
        <Card className="mb-8">
          <CardHeader>
            <p className="text-sm font-semibold text-gray-700">
              Cliques por dia — últimos {days} dias (todas as estruturas)
            </p>
          </CardHeader>
          <CardContent>
            <ClicksChart data={overview.clicksByDay} days={days} />
          </CardContent>
        </Card>
      )}

      {/* Detalhe por estrutura */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Detalhes por Estrutura</h2>
        {structures.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma estrutura encontrada.</p>
        ) : (
          <div className="grid gap-6">
            {structures.map(s => (
              <StructureCard key={s.id} structureId={s.id} structureName={s.name} days={days} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StructureCard({ structureId, structureName, days }: {
  structureId: string; structureName: string; days: 7 | 30
}) {
  const [data,  setData]  = useState<StructureAnalytics | null>(null)
  const [churn, setChurn] = useState<ChurnAnalytics | null>(null)
  const [utm,   setUtm]   = useState<UtmAnalytics | null>(null)
  const [tab,   setTab]   = useState<'clicks' | 'churn' | 'utm'>('clicks')

  useEffect(() => {
    Promise.all([
      api.analytics.structure(structureId),
      api.analytics.churn(structureId),
      api.analytics.utm(structureId, 30),
    ]).then(([d, c, u]) => { setData(d); setChurn(c); setUtm(u) }).catch(console.error)
  }, [structureId])

  if (!data) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />

  const tabs = [
    { key: 'clicks', label: 'Cliques' },
    { key: 'churn',  label: `Churn ${churn ? `(${churn.totalExits})` : ''}` },
    { key: 'utm',    label: 'UTM' },
  ] as const

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{structureName}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{data.smartLink}</p>
          </div>
          <div className="flex gap-3 text-sm text-gray-500 flex-wrap">
            <span><strong className="text-gray-900">{data.totalClicks.toLocaleString('pt-BR')}</strong> cliques</span>
            <span><strong className="text-gray-900">{data.totalMembers}</strong> membros</span>
            {churn && <span className="text-red-600"><strong>{churn.totalExits}</strong> saídas (30d)</span>}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {tab === 'clicks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3">Cliques por dia</p>
              <ClicksChart data={data.clicksByDay} days={days} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3">Grupos ({data.groups.length})</p>
              <div className="space-y-3">
                {data.groups.map(g => (
                  <div key={g.groupId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate">{g.groupName}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-400">{g.memberCount}/{g.maxMembers}</span>
                        <Badge variant={g.status === 'ACTIVE' ? 'green' : g.status === 'FULL' ? 'red' : 'gray'}>
                          {g.status}
                        </Badge>
                      </div>
                    </div>
                    <CapacityBar pct={g.capacityPercentage} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'churn' && churn && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex gap-4 mb-4">
                <div className="bg-red-50 rounded-xl p-3 flex-1 text-center">
                  <p className="text-xl font-bold text-red-600">{churn.totalExits}</p>
                  <p className="text-xs text-red-400">Saídas (30d)</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 flex-1 text-center">
                  <p className="text-xl font-bold text-brand-600">{churn.totalJoins}</p>
                  <p className="text-xs text-gray-400">Entradas (30d)</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 flex-1 text-center">
                  <p className="text-xl font-bold text-orange-600">{(churn.churnRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">Taxa churn</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-2">Saídas por dia</p>
              <ChurnChart data={churn.exitsByDay} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3">Saídas por grupo</p>
              {churn.exitsByGroup.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhuma saída registrada</p>
              ) : (
                <div className="space-y-2">
                  {churn.exitsByGroup.map(g => (
                    <div key={g.groupId} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                      <span className="text-gray-700 truncate">{g.groupName}</span>
                      <span className="text-red-600 font-semibold flex-shrink-0 ml-2">{g.exits} saída{g.exits !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'utm' && utm && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <UtmTable title="Por Fonte (utm_source)"   rows={utm.bySources} />
            <UtmTable title="Por Mídia (utm_medium)"   rows={utm.byMedium} />
            <UtmTable title="Por Campanha (utm_campaign)" rows={utm.byCampaign} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsContent />
    </Suspense>
  )
}
