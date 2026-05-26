'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type {
  AvailableGroup,
  MonitoredGroup,
  Structure,
  WebSessionStatus,
} from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Radio, Trash2, Power, PowerOff, X, Users, AlertCircle, Smartphone,
} from 'lucide-react'

export default function MonitoredGroupsPage() {
  const [monitored, setMonitored]   = useState<MonitoredGroup[]>([])
  const [sessions, setSessions]     = useState<WebSessionStatus[]>([])
  const [structures, setStructures] = useState<Structure[]>([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.monitoredGroups.list(),
      api.whatsappWeb.listSessions(),
      api.structures.list(),
    ])
      .then(([m, s, st]) => {
        setMonitored(m)
        setSessions(s.filter(x => x.status === 'AUTHENTICATED'))
        setStructures(st)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Remover monitoramento deste grupo?')) return
    await api.monitoredGroups.delete(id).catch(e => alert(e.message))
    load()
  }

  const onToggleActive = async (m: MonitoredGroup) => {
    try {
      await api.monitoredGroups.update(m.id, { active: !m.active })
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao atualizar')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-night-50">Grupos Monitorados</h1>
          <p className="text-sm text-night-300 mt-1 max-w-xl">
            Mensagens recebidas em grupos monitorados que contenham um link{' '}
            <code className="text-xs bg-night-700 px-1.5 py-0.5 rounded">https://meli.la/...</code>{' '}
            são automaticamente reenviadas para os grupos da estrutura vinculada.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          disabled={sessions.length === 0 || structures.length === 0}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {/* Validações de pré-requisitos */}
      {!loading && sessions.length === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Nenhuma sessão WhatsApp autenticada</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Conecte uma conta WhatsApp via QR Code antes de configurar monitoramento.
              </p>
            </div>
            <Link href="/dashboard/whatsapp/connect">
              <Button size="sm" variant="ghost">
                <Smartphone className="w-4 h-4" />
                Conectar
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && sessions.length > 0 && structures.length === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Nenhuma estrutura criada</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Crie ao menos uma estrutura para definir o destino das mensagens reencaminhadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de monitorados */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-night-700 rounded-xl animate-pulse" />)}
        </div>
      ) : monitored.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Radio className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-night-300 mb-1">Nenhum grupo sendo monitorado</p>
            <p className="text-xs text-night-400">Adicione um grupo para começar a redistribuir mensagens</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {monitored.map(m => (
            <Card key={m.id} className={m.active ? '' : 'opacity-60'}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  m.active ? 'bg-green-50' : 'bg-night-700'
                }`}>
                  <Radio className={`w-5 h-5 ${m.active ? 'text-green-600' : 'text-night-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-night-50 text-sm">
                      {m.whatsappGroupName || m.whatsappGroupId}
                    </p>
                    <Badge variant={m.active ? 'green' : 'gray'}>
                      {m.active ? 'Ativo' : 'Pausado'}
                    </Badge>
                  </div>
                  <p className="text-xs text-night-300 mt-1">
                    Reenvia para a estrutura <span className="font-medium text-night-200">{m.structureName}</span>
                  </p>
                  {m.messagePrefix && (
                    <p className="text-xs text-night-400 mt-1">
                      Prefixo: <code className="bg-night-700 px-1 py-0.5 rounded">{m.messagePrefix}</code>
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    title={m.active ? 'Pausar' : 'Ativar'}
                    className="p-1.5 rounded-lg hover:bg-night-700 transition-colors"
                    onClick={() => onToggleActive(m)}
                  >
                    {m.active
                      ? <PowerOff className="w-4 h-4 text-night-300" />
                      : <Power className="w-4 h-4 text-green-600" />}
                  </button>
                  <button
                    title="Remover"
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => onDelete(m.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de criação */}
      {showModal && (
        <AddMonitoredGroupModal
          sessions={sessions}
          structures={structures}
          monitored={monitored}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Modal ──────────────────────────────────────────────────────

function AddMonitoredGroupModal({
  sessions, structures, monitored, onClose, onSaved,
}: {
  sessions:   WebSessionStatus[]
  structures: Structure[]
  monitored:  MonitoredGroup[]
  onClose:    () => void
  onSaved:    () => void
}) {
  const [sessionId, setSessionId]       = useState(sessions[0]?.sessionId ?? '')
  const [availableGroups, setAvailable] = useState<AvailableGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupId, setGroupId]           = useState('')
  const [structureId, setStructureId]   = useState(structures[0]?.id ?? '')
  const [prefix, setPrefix]             = useState('')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  // Carrega grupos da sessão selecionada
  useEffect(() => {
    if (!sessionId) return
    setGroupsLoading(true)
    setError('')
    api.monitoredGroups.listAvailable(sessionId)
      .then(setAvailable)
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar grupos'))
      .finally(() => setGroupsLoading(false))
  }, [sessionId])

  // IDs já monitorados nessa sessão (para esconder do select)
  const alreadyInSession = new Set(
    monitored.filter(m => m.sessionId === sessionId).map(m => m.whatsappGroupId)
  )
  const selectableGroups = availableGroups.filter(
    g => !alreadyInSession.has(g.groupId) && !g.alreadyMonitored
  )

  const handleSubmit = async () => {
    setError('')
    if (!sessionId || !groupId || !structureId) {
      setError('Selecione sessão, grupo e estrutura')
      return
    }
    setSaving(true)
    try {
      const selected = availableGroups.find(g => g.groupId === groupId)
      await api.monitoredGroups.create({
        sessionId,
        whatsappGroupId:   groupId,
        whatsappGroupName: selected?.name,
        structureId,
        messagePrefix:     prefix.trim() || undefined,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-night-700 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Radio className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-night-50">Adicionar grupo monitorado</h2>
          </div>
          <button className="text-night-400 hover:text-night-200" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sessão */}
          <div>
            <label className="text-sm font-medium text-night-200 block mb-1">
              Conta WhatsApp (sessão autenticada)
            </label>
            <select
              className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={sessionId}
              onChange={e => { setSessionId(e.target.value); setGroupId('') }}
            >
              {sessions.map(s => (
                <option key={s.sessionId} value={s.sessionId}>
                  {s.phone ?? s.sessionId}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          <div>
            <label className="text-sm font-medium text-night-200 block mb-1">
              Grupo a monitorar
            </label>
            {groupsLoading ? (
              <div className="text-sm text-night-400 py-2">Carregando grupos…</div>
            ) : selectableGroups.length === 0 ? (
              <div className="text-sm text-night-400 py-2">
                Nenhum grupo disponível nesta sessão
              </div>
            ) : (
              <select
                className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
              >
                <option value="">Selecione um grupo…</option>
                {selectableGroups.map(g => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.name} ({g.participants} participantes)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Estrutura */}
          <div>
            <label className="text-sm font-medium text-night-200 block mb-1">
              Estrutura de destino
            </label>
            <select
              className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={structureId}
              onChange={e => setStructureId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {structures.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-xs text-night-400 mt-1">
              <Users className="w-3 h-3 inline mr-1" />
              As mensagens serão reenviadas para todos os grupos ativos desta estrutura.
            </p>
          </div>

          {/* Prefixo */}
          <div>
            <label className="text-sm font-medium text-night-200 block mb-1">
              Prefixo da mensagem <span className="text-night-400 text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="🔥 PROMO MELI:"
              value={prefix}
              onChange={e => setPrefix(e.target.value)}
              className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-night-400 mt-1">
              Adicionado no início de cada mensagem reencaminhada.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            className="flex-1"
            loading={saving}
            disabled={!groupId || !structureId}
            onClick={handleSubmit}
          >
            Adicionar
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  )
}
