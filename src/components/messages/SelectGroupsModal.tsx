'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Group } from '@/types'
import { Button } from '@/components/ui/Button'
import { Loader2, Users, X } from 'lucide-react'

interface Props {
  open: boolean
  structureId: string
  onClose: () => void
  onConfirm: (groupIds: string[]) => void
}

export function SelectGroupsModal({ open, structureId, onClose, onConfirm }: Props) {
  const [groups, setGroups]       = useState<Group[]>([])
  const [loading, setLoading]     = useState(false)
  const [sendToAll, setSendToAll] = useState(true)
  const [selected, setSelected]   = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSendToAll(true)
    setSelected(new Set())
    api.structures.get(structureId)
      .then(s => setGroups(s.groups.filter(g => g.status === 'ACTIVE' || g.status === 'FULL')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open, structureId])

  if (!open) return null

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected(prev =>
      prev.size === groups.length ? new Set() : new Set(groups.map(g => g.id))
    )

  const handleConfirm = () => {
    onConfirm(sendToAll ? [] : Array.from(selected))
  }

  const canConfirm = sendToAll || selected.size > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-night-600">
          <div>
            <h2 className="text-base font-semibold text-night-50">Para quais grupos enviar?</h2>
            <p className="text-xs text-night-400 mt-0.5">Escolha os grupos de destino desta estrutura</p>
          </div>
          <button onClick={onClose} className="text-night-400 hover:text-night-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* toggle todos / selecionar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setSendToAll(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                sendToAll
                  ? 'border-brand-500 bg-brand-900/20 text-brand-300'
                  : 'border-night-600 text-night-300 hover:border-night-500'
              }`}
            >
              <Users className="w-4 h-4" />
              Todos os grupos
            </button>
            <button
              onClick={() => setSendToAll(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                !sendToAll
                  ? 'border-brand-500 bg-brand-900/20 text-brand-300'
                  : 'border-night-600 text-night-300 hover:border-night-500'
              }`}
            >
              Selecionar grupos
            </button>
          </div>
        </div>

        {/* group list */}
        {!sendToAll && (
          <div className="px-6 pb-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-night-400" />
              </div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-night-400 text-center py-4">
                Nenhum grupo ativo encontrado
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b border-night-600 mb-1">
                  <span className="text-xs text-night-400">
                    {selected.size} de {groups.length} selecionado{selected.size !== 1 ? 's' : ''}
                  </span>
                  <button className="text-xs text-brand-500 hover:underline" onClick={toggleAll}>
                    {selected.size === groups.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>

                <div className="space-y-1">
                  {groups.map(g => (
                    <label
                      key={g.id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-night-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(g.id)}
                        onChange={() => toggle(g.id)}
                        className="accent-brand-500 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-night-50 truncate">{g.name}</p>
                        <p className="text-xs text-night-400">
                          {g.memberCount}/{g.maxMembers} membros
                          · {Math.round(g.capacityPercentage * 100)}%
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        g.status === 'ACTIVE'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {g.status === 'ACTIVE' ? 'Ativo' : 'Cheio'}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-night-600 mt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" disabled={!canConfirm} onClick={handleConfirm}>
            {sendToAll
              ? `Enviar para todos (${groups.length})`
              : `Enviar para ${selected.size} grupo${selected.size !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
