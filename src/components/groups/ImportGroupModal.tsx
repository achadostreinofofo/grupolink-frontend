'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Loader2, Smartphone, Users, Download, CheckCircle2, ArrowLeft, Settings2 } from 'lucide-react'

type Step = 'session' | 'groups' | 'config'

interface WhatsappGroup {
  groupId: string
  name: string
  participants: number
}

interface Props {
  structureId: string
  structureName: string
  onSuccess: () => void
  onClose: () => void
}

const THRESHOLD_OPTIONS = [
  { label: '50%', value: 0.50 },
  { label: '60%', value: 0.60 },
  { label: '70%', value: 0.70 },
  { label: '80%', value: 0.80, default: true },
  { label: '90%', value: 0.90 },
]

export function ImportGroupModal({ structureId, structureName, onSuccess, onClose }: Props) {
  const [step, setStep]                           = useState<Step>('session')
  const [sessions, setSessions]                   = useState<WebSessionStatus[]>([])
  const [loadingSessions, setLoadingSessions]     = useState(true)
  const [selectedSession, setSelectedSession]     = useState<WebSessionStatus | null>(null)
  const [groups, setGroups]                       = useState<WhatsappGroup[]>([])
  const [loadingGroups, setLoadingGroups]         = useState(false)
  const [groupsError, setGroupsError]             = useState('')
  const [selectedGroup, setSelectedGroup]         = useState<WhatsappGroup | null>(null)
  const [maxMembers, setMaxMembers]               = useState(256)
  const [fillThreshold, setFillThreshold]         = useState(0.80)
  const [importing, setImporting]                 = useState(false)
  const [importError, setImportError]             = useState('')
  const [imported, setImported]                   = useState(false)

  useEffect(() => {
    api.whatsappWeb.listSessions()
      .then(data => setSessions(data.filter(s => s.status === 'AUTHENTICATED')))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false))
  }, [])

  const selectSession = async (session: WebSessionStatus) => {
    setSelectedSession(session)
    setStep('groups')
    setLoadingGroups(true)
    setGroupsError('')
    try {
      const data = await api.whatsappWeb.listGroups(session.sessionId)
      setGroups(data)
    } catch {
      setGroupsError('Não foi possível carregar os grupos. Verifique se a sessão ainda está ativa.')
    } finally {
      setLoadingGroups(false)
    }
  }

  const selectGroup = (group: WhatsappGroup) => {
    setSelectedGroup(group)
    const minMembers = Math.max(group.participants, 50)
    setMaxMembers(Math.max(minMembers, 256))
    setStep('config')
  }

  const handleImport = async () => {
    if (!selectedGroup) return
    setImporting(true)
    setImportError('')
    try {
      await api.structures.importGroup(structureId, {
        whatsappGroupId: selectedGroup.groupId,
        maxMembersPerGroup: maxMembers,
        fillThreshold,
      })
      setImported(true)
      setTimeout(() => { onSuccess(); onClose() }, 1500)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Erro ao importar grupo')
    } finally {
      setImporting(false)
    }
  }

  const backLabel = step === 'groups' ? 'session' : 'groups'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-night-600">
          <div className="flex items-center gap-2">
            {!imported && step !== 'session' && (
              <button
                onClick={() => setStep(backLabel as Step)}
                className="text-night-400 hover:text-night-100 mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-semibold text-night-50">Importar grupo existente</h2>
          </div>
          <button onClick={onClose} className="text-night-400 hover:text-night-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {!imported && (
          <div className="flex px-6 pt-3 gap-1">
            {(['session', 'groups', 'config'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                step === s || (['groups', 'config'].includes(step) && i === 0) || (step === 'config' && i <= 1)
                  ? 'bg-brand-500'
                  : 'bg-night-600'
              }`} />
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* Sucesso */}
          {imported && (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <p className="font-semibold text-night-50">Grupo importado com sucesso!</p>
              <p className="text-sm text-night-300">O grupo foi adicionado à estrutura <strong>{structureName}</strong>.</p>
            </div>
          )}

          {/* Step 1: selecionar sessão */}
          {!imported && step === 'session' && (
            <>
              <p className="text-sm text-night-300 mb-4">
                Selecione a conta WhatsApp conectada para listar os grupos disponíveis.
              </p>
              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-night-400" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-sm text-night-300">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-night-500" />
                  <p>Nenhuma conta WhatsApp conectada.</p>
                  <p className="mt-1">Conecte uma conta em <strong>Integrações → WhatsApp</strong>.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map(s => (
                    <button key={s.sessionId} onClick={() => selectSession(s)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-night-600 hover:border-brand-600 hover:bg-brand-900/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-night-50">{s.phone ? `+${s.phone}` : 'WhatsApp conectado'}</p>
                        <p className="text-xs text-night-400">Toque para ver os grupos</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: selecionar grupo */}
          {!imported && step === 'groups' && (
            <>
              <p className="text-sm text-night-300 mb-4">
                Selecione o grupo que deseja importar para <strong className="text-night-100">{structureName}</strong>.
              </p>
              {loadingGroups ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-night-400" />
                </div>
              ) : groupsError ? (
                <p className="text-sm text-red-400 text-center py-4">{groupsError}</p>
              ) : groups.length === 0 ? (
                <p className="text-sm text-night-400 text-center py-6">Nenhum grupo onde você é criador foi encontrado.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {groups.map(g => (
                    <button key={g.groupId} onClick={() => selectGroup(g)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-night-600 hover:border-brand-600 hover:bg-night-700 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-night-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-night-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-night-50 truncate">{g.name}</p>
                        <p className="text-xs text-night-400">{g.participants} participantes</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-night-500 rotate-180 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 3: configurações */}
          {!imported && step === 'config' && selectedGroup && (
            <>
              <div className="flex items-center gap-2 mb-4 p-3 bg-night-700 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-brand-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-night-50 truncate">{selectedGroup.name}</p>
                  <p className="text-xs text-night-400">{selectedGroup.participants} participantes atualmente</p>
                </div>
              </div>

              {/* Max membros */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-night-200">Limite de participantes por grupo</label>
                  <span className="text-sm font-semibold text-brand-400">{maxMembers}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(selectedGroup.participants, 50)}
                  max={1024}
                  step={10}
                  value={maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-night-400 mt-1">
                  <span>{Math.max(selectedGroup.participants, 50)} (mín)</span>
                  <span>1024 (máx)</span>
                </div>
              </div>

              {/* Fill threshold */}
              <div className="mb-5">
                <label className="text-sm font-medium text-night-200 block mb-2">
                  Criar próximo grupo quando atingir
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {THRESHOLD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFillThreshold(opt.value)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                        fillThreshold === opt.value
                          ? 'bg-brand-500 text-night-900 border-brand-500'
                          : 'bg-night-700 text-night-200 border-night-600 hover:border-brand-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-night-400 mt-2">
                  Um novo grupo será criado automaticamente quando {Math.round(fillThreshold * 100)}% dos {maxMembers} lugares forem preenchidos ({Math.round(maxMembers * fillThreshold)} membros).
                </p>
              </div>

              {importError && (
                <p className="text-sm text-red-400 mb-3">{importError}</p>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={onClose} disabled={importing}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importando...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Importar grupo</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
