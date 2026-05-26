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
  onConfirm: (participantJids: string[]) => void
  loading?: boolean
}

export function CreateGroupParticipantsModal({ open, groupName, onClose, onConfirm, loading }: Props) {
  const [sessions, setSessions] = useState<WebSessionStatus[]>([])
  const [fetching, setFetching] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setFetching(true)
    setSelected(new Set())
    api.whatsappWeb.listSessions()
      .then(s => {
        const auth = s.filter(x => x.status === 'AUTHENTICATED')
        setSessions(auth)
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
    const jids = sessions
      .filter(s => selected.has(s.sessionId) && s.phone)
      .map(s => `${s.phone}@s.whatsapp.net`)
    onConfirm(jids)
  }

  const creator      = sessions[0]
  const participants = sessions.slice(1)
  const canConfirm   = hasEnough && selected.size >= 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={loading ? undefined : onClose} />

      <div className="relative bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-night-600">
          <div>
            <h2 className="text-base font-semibold text-night-50">Criar grupo no WhatsApp</h2>
            <p className="text-xs text-night-400 mt-0.5">
              Grupo: <span className="font-medium text-night-200">{groupName}</span>
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-night-400 hover:text-night-100 ml-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-night-400" />
            </div>

          ) : !hasEnough ? (
            <div className="space-y-3">
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">
                      Mínimo de 2 contas WhatsApp necessário
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      O WhatsApp exige pelo menos 2 participantes para criar um grupo.
                      Além disso, a plataforma precisa de 2 contas conectadas para criar
                      os próximos grupos automaticamente quando a capacidade for atingida.
                    </p>
                  </div>
                </div>
              </div>

              {sessions.length === 1 && (
                <div className="bg-night-700 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-night-50">+{sessions[0].phone}</p>
                    <p className="text-xs text-night-400">1 conta conectada</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3 text-sm text-blue-300">
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
            <div className="space-y-3">
              {/* Conta criadora */}
              <div>
                <p className="text-xs font-medium text-night-400 mb-1.5 uppercase tracking-wide">
                  Conta criadora (admin)
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-900/20 border border-brand-700/40">
                  <div className="w-8 h-8 rounded-full bg-brand-900/40 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-night-50">+{creator.phone}</p>
                    <p className="text-xs text-night-400">Criará o grupo e será admin</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                </div>
              </div>

              {/* Contas participantes */}
              <div>
                <p className="text-xs font-medium text-night-400 mb-1.5 uppercase tracking-wide">
                  Contas participantes
                </p>
                <div className="space-y-2">
                  {participants.map(s => (
                    <label
                      key={s.sessionId}
                      className="flex items-center gap-3 p-3 rounded-xl border border-night-600 hover:border-brand-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.sessionId)}
                        onChange={() => toggle(s.sessionId)}
                        className="accent-brand-500 w-4 h-4 flex-shrink-0"
                      />
                      <div className="w-8 h-8 rounded-full bg-night-600 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 text-night-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-night-50">+{s.phone}</p>
                        <p className="text-xs text-night-400">Também usada em criações automáticas</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs text-night-400">
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
