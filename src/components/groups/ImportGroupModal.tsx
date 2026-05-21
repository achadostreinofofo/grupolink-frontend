'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, Loader2, Smartphone, Users, Download, CheckCircle2, ArrowLeft } from 'lucide-react'

type Step = 'session' | 'groups' | 'importing'

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

export function ImportGroupModal({ structureId, structureName, onSuccess, onClose }: Props) {
  const [step, setStep]               = useState<Step>('session')
  const [sessions, setSessions]       = useState<WebSessionStatus[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [selectedSession, setSelectedSession] = useState<WebSessionStatus | null>(null)
  const [groups, setGroups]           = useState<WhatsappGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [groupsError, setGroupsError] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<WhatsappGroup | null>(null)
  const [importing, setImporting]     = useState(false)
  const [importError, setImportError] = useState('')
  const [imported, setImported]       = useState(false)

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

  const handleImport = async () => {
    if (!selectedGroup) return
    setImporting(true)
    setImportError('')
    try {
      await api.structures.importGroup(structureId, { whatsappGroupId: selectedGroup.groupId })
      setImported(true)
      setTimeout(() => { onSuccess(); onClose() }, 1500)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Erro ao importar grupo')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {step === 'groups' && !imported && (
              <button onClick={() => { setStep('session'); setSelectedGroup(null) }} className="text-gray-400 hover:text-gray-600 mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-semibold text-gray-900">Importar grupo existente</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* Sucesso */}
          {imported && (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-900">Grupo importado com sucesso!</p>
              <p className="text-sm text-gray-500">O grupo foi adicionado à estrutura <strong>{structureName}</strong>.</p>
            </div>
          )}

          {/* Step 1: selecionar sessão */}
          {!imported && step === 'session' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Selecione a conta WhatsApp conectada para listar os grupos disponíveis.
              </p>
              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma conta WhatsApp conectada.</p>
                  <p className="mt-1">Conecte uma conta em <strong>Integrações → WhatsApp</strong>.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map(s => (
                    <button
                      key={s.sessionId}
                      onClick={() => selectSession(s)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.phone ? `+${s.phone}` : 'WhatsApp conectado'}
                        </p>
                        <p className="text-xs text-gray-400">Toque para ver os grupos</p>
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
              <p className="text-sm text-gray-500 mb-1">
                Selecione o grupo que deseja importar para <strong>{structureName}</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                O grupo será importado como <em>&ldquo;{'{nome do grupo}'} #1&rdquo;</em>. Os grupos seguintes serão criados automaticamente.
              </p>

              {loadingGroups ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : groupsError ? (
                <p className="text-sm text-red-500 text-center py-4">{groupsError}</p>
              ) : groups.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum grupo encontrado para esta conta.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {groups.map(g => (
                    <button
                      key={g.groupId}
                      onClick={() => setSelectedGroup(g)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        selectedGroup?.groupId === g.groupId
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.participants} participantes</p>
                      </div>
                      {selectedGroup?.groupId === g.groupId && (
                        <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {importError && (
                <p className="text-sm text-red-500 mt-3">{importError}</p>
              )}

              <div className="flex gap-3 mt-5">
                <Button variant="ghost" className="flex-1" onClick={onClose} disabled={importing}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleImport}
                  disabled={!selectedGroup || importing}
                >
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
