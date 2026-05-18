'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, Loader2, Smartphone, X } from 'lucide-react'
import Link from 'next/link'

interface Props {
  open: boolean
  groupName: string
  onClose: () => void
  /** Retorna os JIDs das contas participantes (excluindo o criador — adicionado automaticamente) */
  onConfirm: (participantJids: string[]) => void
  loading?: boolean
}

export function CreateGroupParticipantsModal({ open, groupName, onClose, onConfirm, loading }: Props) {
  const [sessions, setSessions]   = useState<WebSessionStatus[]>([])
  const [fetching, setFetching]   = useState(false)
  const [selected, setSelected]   = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setFetching(true)
    setSelected(new Set())
    api.whatsappWeb.listSessions()
      .then(s => {
        const auth = s.filter(x => x.status === 'AUTHENTICATED')
        setSessions(auth)
        // Pré-seleciona todas as contas exceto a primeira (que será o criador)
        if (auth.length >= 2) {
          setSelected(new Set(auth.slice(1).map(x => x.sessionId)))
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [open])

  if (!open) return null

  const hasEnough = sessions.length >= 2

  const toggle = (sessionId: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId)
      return next
    })

  const handleConfirm = () => {
    // Monta JIDs das contas participantes (exceto o criador = sessions[0])
    const jids = sessions
      .filter(s => selected.has(s.sessionId) && s.phone)
      .map(s => `55${s.phone}@s.whatsapp.net`)
    onConfirm(jids)
  }

  const creator = sessions[0]
  const participants = sessions.slice(1)
  const canConfirm = hasEnough && selected.size >= 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Criar grupo no WhatsApp</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Grupo: <span className="font-medium text-gray-600">{groupName}</span>
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>

          ) : !hasEnough ? (
            /* ── Menos de 2 contas ── */
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Mínimo de 2 contas WhatsApp necessário
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      O WhatsApp exige pelo menos 2 participantes para criar um grupo.
                      Além disso, a plataforma precisa de 2 contas conectadas para criar
                      os próximos grupos automaticamente quando a capacidade for atingida.
                    </p>
                  </div>
                </div>
              </div>

              {sessions.length === 1 && (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">+{sessions[0].phone}</p>
                    <p className="text-xs text-gray-400">1 conta conectada</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
                Conecte uma segunda conta em{' '}
                <Link
                  href="/dashboard/integrations"
                  className="font-semibold underline"
                  onClick={onClose}
                >
                  WhatsApp → Conectar via QR Code
                </Link>
                {' '}e volte aqui.
              </div>
            </div>

          ) : (
            /* ── 2+ contas: mostra criador + participantes ── */
            <div className="space-y-3">
              {/* Conta criadora (não selecionável — é sempre o admin) */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Conta criadora (admin)
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">+{creator.phone}</p>
                    <p className="text-xs text-gray-400">Criará o grupo e será admin</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                </div>
              </div>

              {/* Contas participantes (selecionáveis) */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Contas participantes
                </p>
                <div className="space-y-2">
                  {participants.map(s => (
                    <label
                      key={s.sessionId}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.sessionId)}
                        onChange={() => toggle(s.sessionId)}
                        className="accent-teal-500 w-4 h-4 flex-shrink-0"
                      />
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">+{s.phone}</p>
                        <p className="text-xs text-gray-400">Também usada em criações automáticas</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                As contas selecionadas serão usadas em todos os grupos criados automaticamente nesta estrutura.
              </p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          {hasEnough && (
            <Button
              className="flex-1"
              disabled={!canConfirm || loading}
              loading={loading}
              onClick={handleConfirm}
            >
              Criar grupo
            </Button>
          )}
          {!hasEnough && !fetching && (
            <Link href="/dashboard/integrations" className="flex-1" onClick={onClose}>
              <Button className="w-full">Conectar conta</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
