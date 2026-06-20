'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Loader2, Smartphone, Users, Download, CheckCircle2, ArrowLeft, Check } from 'lucide-react'

type Step = 'session' | 'groups' | 'config'

interface WhatsappGroup {
  groupId: string
  name: string
  participants: number
}

interface Props {
  structureId: string
  structureName: string
  remainingSlots?: number | null   // vagas restantes no plano; null = ilimitado
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

export function ImportGroupModal({ structureId, structureName, remainingSlots, onSuccess, onClose }: Props) {
  const [step, setStep]                       = useState<Step>('session')
  const [sessions, setSessions]               = useState<WebSessionStatus[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [selectedSession, setSelectedSession] = useState<WebSessionStatus | null>(null)
  const [groups, setGroups]                   = useState<WhatsappGroup[]>([])
  const [loadingGroups, setLoadingGroups]     = useState(false)
  const [groupsError, setGroupsError]         = useState('')
  const [selectedGroups, setSelectedGroups]   = useState<WhatsappGroup[]>([])
  const [maxMembers, setMaxMembers]           = useState(256)
  const [fillThreshold, setFillThreshold]     = useState(0.80)
  const [importing, setImporting]             = useState(false)
  const [importError, setImportError]         = useState('')
  const [imported, setImported]               = useState(false)
  const [importedCount, setImportedCount]     = useState(0)
  const [failedCount, setFailedCount]         = useState(0)

  // Maior contagem entre os grupos selecionados — o limite por grupo nunca fica abaixo disso.
  const maxParticipants = selectedGroups.reduce((m, g) => Math.max(m, g.participants), 0)
  const minMembers = Math.max(maxParticipants, 50)

  // Bloqueio antecipado pelo limite do plano (null = ilimitado).
  const slotsLimited = remainingSlots != null
  const noSlots      = slotsLimited && remainingSlots! <= 0
  const atLimit      = slotsLimited && selectedGroups.length >= remainingSlots!

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

  const toggleGroup = (group: WhatsappGroup) => {
    setSelectedGroups(prev => {
      const exists = prev.some(g => g.groupId === group.groupId)
      if (exists) return prev.filter(g => g.groupId !== group.groupId)
      // Não deixa selecionar além das vagas do plano
      if (slotsLimited && prev.length >= remainingSlots!) return prev
      return [...prev, group]
    })
  }

  const goToConfig = () => {
    if (selectedGroups.length === 0) return
    setMaxMembers(Math.max(minMembers, 256))
    setStep('config')
  }

  const handleImport = async () => {
    if (selectedGroups.length === 0) return
    setImporting(true)
    setImportError('')
    try {
      const res = await api.structures.importGroups(structureId, {
        whatsappGroupIds: selectedGroups.map(g => g.groupId),
        maxMembersPerGroup: maxMembers,
        fillThreshold,
      })
      setImportedCount(res.imported.length)
      setFailedCount(res.failed.length)
      setImported(true)
      setTimeout(() => { onSuccess(); onClose() }, 1800)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Erro ao importar grupos')
    } finally {
      setImporting(false)
    }
  }

  const isSelected = (g: WhatsappGroup) => selectedGroups.some(s => s.groupId === g.groupId)
  const backLabel = step === 'groups' ? 'session' : 'groups'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-night-600">
          <div className="flex items-center gap-2">
            {!imported && step !== 'session' && (
              <button onClick={() => setStep(backLabel as Step)} className="text-night-400 hover:text-night-100 mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-semibold text-night-50">Importar grupos existentes</h2>
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
              <p className="font-semibold text-night-50">
                {importedCount} grupo{importedCount === 1 ? '' : 's'} importado{importedCount === 1 ? '' : 's'} com sucesso!
              </p>
              <p className="text-sm text-night-300">
                Adicionado{importedCount === 1 ? '' : 's'} à estrutura <strong>{structureName}</strong>.
              </p>
              {failedCount > 0 && (
                <p className="text-sm text-amber-400">
                  {failedCount} grupo{failedCount === 1 ? '' : 's'} não pôde{failedCount === 1 ? '' : 'ram'} ser importado{failedCount === 1 ? '' : 's'}.
                </p>
              )}
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

          {/* Step 2: selecionar grupos (multi) */}
          {!imported && step === 'groups' && (
            <>
              <p className="text-sm text-night-300 mb-3">
                Selecione os grupos que deseja importar para <strong className="text-night-100">{structureName}</strong>.
              </p>

              {noSlots ? (
                <div className="bg-amber-900/20 border border-amber-800/40 text-amber-300 text-sm rounded-lg px-3 py-2 mb-3">
                  Você atingiu o limite de grupos por estrutura do seu plano. Faça upgrade para importar mais.
                </div>
              ) : slotsLimited && (
                <div className="flex items-center justify-between text-xs text-night-400 mb-3">
                  <span>{selectedGroups.length} selecionado{selectedGroups.length === 1 ? '' : 's'}</span>
                  <span>{remainingSlots} vaga{remainingSlots === 1 ? '' : 's'} no seu plano</span>
                </div>
              )}

              {loadingGroups ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-night-400" />
                </div>
              ) : groupsError ? (
                <p className="text-sm text-red-400 text-center py-4">{groupsError}</p>
              ) : groups.length === 0 ? (
                <p className="text-sm text-night-400 text-center py-6">Nenhum grupo onde você é criador foi encontrado.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {groups.map(g => {
                      const disabled = !isSelected(g) && atLimit
                      return (
                        <button key={g.groupId} onClick={() => toggleGroup(g)} disabled={disabled}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                            isSelected(g) ? 'border-brand-500 bg-brand-900/15' : 'border-night-600 hover:border-brand-600 hover:bg-night-700'
                          } ${disabled ? 'opacity-40 cursor-not-allowed hover:border-night-600 hover:bg-transparent' : ''}`}>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${
                            isSelected(g) ? 'bg-brand-500 border-brand-500' : 'border-night-500'
                          }`}>
                            {isSelected(g) && <Check className="w-3.5 h-3.5 text-night-900" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-night-50 truncate">{g.name}</p>
                            <p className="text-xs text-night-400">{g.participants} participantes</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <Button className="w-full mt-4" onClick={goToConfig} disabled={selectedGroups.length === 0}>
                    Continuar
                    {selectedGroups.length > 0 ? ` (${selectedGroups.length})` : ''}
                  </Button>
                </>
              )}
            </>
          )}

          {/* Step 3: configurações */}
          {!imported && step === 'config' && selectedGroups.length > 0 && (
            <>
              <div className="mb-4 p-3 bg-night-700 rounded-xl">
                <p className="text-sm font-medium text-night-50">
                  {selectedGroups.length} grupo{selectedGroups.length === 1 ? '' : 's'} selecionado{selectedGroups.length === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-night-400 mt-0.5">Maior grupo: {maxParticipants} participantes</p>
              </div>

              {/* Max membros */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-night-200">Limite de participantes por grupo</label>
                  <span className="text-sm font-semibold text-brand-400">{maxMembers}</span>
                </div>
                <input
                  type="range"
                  min={minMembers}
                  max={1024}
                  step={10}
                  value={maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-night-400 mt-1">
                  <span>{minMembers} (mín)</span>
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
                    <><Download className="w-4 h-4 mr-2" /> Importar {selectedGroups.length} grupo{selectedGroups.length === 1 ? '' : 's'}</>
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
