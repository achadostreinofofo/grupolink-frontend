'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Structure } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Network, Plus, Users, ChevronRight, Copy, Trash2 } from 'lucide-react'
import { DeleteStructureModal } from '@/components/structures/DeleteStructureModal'

function CapacityBar({ groups }: { groups: Structure['groups'] }) {
  const active = groups.filter(g => g.status === 'ACTIVE' || g.status === 'FULL')
  if (active.length === 0) return null
  const totalMembers = active.reduce((a, g) => a + g.memberCount, 0)
  const totalMax     = active.reduce((a, g) => a + g.maxMembers, 0)
  const pct = totalMax > 0 ? Math.min((totalMembers / totalMax) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-400' : pct >= 75 ? 'bg-yellow-400' : 'bg-brand-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function GroupStatusSummary({ groups }: { groups: Structure['groups'] }) {
  const counts = groups.reduce<Record<string, number>>((acc, g) => {
    acc[g.status] = (acc[g.status] ?? 0) + 1
    return acc
  }, {})
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {counts['ACTIVE']   && <Badge variant="green">{counts['ACTIVE']} ativo{counts['ACTIVE'] > 1 ? 's' : ''}</Badge>}
      {counts['FULL']     && <Badge variant="red">{counts['FULL']} cheio{counts['FULL'] > 1 ? 's' : ''}</Badge>}
      {counts['CREATING'] && <Badge variant="yellow">{counts['CREATING']} criando</Badge>}
      {counts['INACTIVE'] && <Badge variant="gray">{counts['INACTIVE']} inativo{counts['INACTIVE'] > 1 ? 's' : ''}</Badge>}
    </div>
  )
}

export default function StructuresPage() {
  const [structures, setStructures]             = useState<Structure[]>([])
  const [loading, setLoading]                   = useState(true)
  const [copied, setCopied]                     = useState<string | null>(null)
  const [deletingStructure, setDeletingStructure] = useState<Structure | null>(null)

  useEffect(() => {
    api.structures.list()
      .then(setStructures)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyLink = async (e: React.MouseEvent, link: string, id: string) => {
    e.preventDefault()
    await navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estruturas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus containers de grupos WhatsApp com smart links
          </p>
        </div>
        <Link href="/dashboard/structures/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Estrutura
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : structures.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Network className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Nenhuma estrutura ainda</p>
            <p className="text-sm text-gray-500 mb-5">
              Crie sua primeira estrutura para começar a distribuir membros entre grupos WhatsApp
            </p>
            <Link href="/dashboard/structures/new">
              <Button>
                <Plus className="w-4 h-4" />
                Criar primeira estrutura
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {structures.map(s => {
            const totalMembers = s.groups.reduce((a, g) => a + g.memberCount, 0)
            const totalMax     = s.groups.reduce((a, g) => a + g.maxMembers, 0)
            const activeGroups = s.groups.filter(g => g.status === 'ACTIVE').length

            return (
              <Link key={s.id} href={`/dashboard/structures/${s.id}`}>
                <Card className="hover:border-brand-200 transition-colors cursor-pointer group">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <Network className="w-5 h-5 text-brand-600" />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          {!s.active && <Badge variant="gray">Inativa</Badge>}
                        </div>

                        {s.description && (
                          <p className="text-xs text-gray-400 truncate mb-1.5">{s.description}</p>
                        )}

                        {/* Smart link row */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-400 font-mono truncate">{s.smartLink}</span>
                          <button
                            onClick={(e) => copyLink(e, s.smartLink, s.id)}
                            className="flex-shrink-0 text-gray-300 hover:text-brand-500 transition-colors"
                            title="Copiar smart link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copied === s.id && (
                            <span className="text-xs text-brand-500 font-medium">Copiado!</span>
                          )}
                        </div>

                        {/* Capacity bar */}
                        <CapacityBar groups={s.groups} />
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm flex-shrink-0">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{s.groups.length}</p>
                          <p className="text-xs text-gray-400">grupos</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{totalMembers.toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-gray-400">membros</p>
                        </div>
                        {totalMax > 0 && (
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">
                              {Math.round((totalMembers / totalMax) * 100)}%
                            </p>
                            <p className="text-xs text-gray-400">capacidade</p>
                          </div>
                        )}
                      </div>

                      {/* Delete button + Arrow */}
                      <button
                        onClick={e => { e.preventDefault(); setDeletingStructure(s) }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 self-center"
                        title="Excluir estrutura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors flex-shrink-0 self-center" />
                    </div>

                    {/* Status badges row */}
                    {s.groups.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <GroupStatusSummary groups={s.groups} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <DeleteStructureModal
        open={!!deletingStructure}
        structureName={deletingStructure?.name ?? ''}
        onClose={() => setDeletingStructure(null)}
        onConfirm={async () => {
          if (!deletingStructure) return
          await api.structures.delete(deletingStructure.id)
          setStructures(prev => prev.filter(s => s.id !== deletingStructure.id))
          setDeletingStructure(null)
        }}
      />
    </div>
  )
}
