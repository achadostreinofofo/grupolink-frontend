'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  open: boolean
  structureName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteStructureModal({ open, structureName, onClose, onConfirm }: Props) {
  const [typed, setTyped]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (!open) return null

  const confirmed = typed.trim().toLowerCase() === 'excluir'

  const handleConfirm = async () => {
    if (!confirmed) return
    setLoading(true)
    setError('')
    try {
      await onConfirm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir estrutura')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setTyped('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      <div className="relative bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-night-50">Excluir estrutura</h2>
              <p className="text-xs text-night-400 mt-0.5">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          {!loading && (
            <button onClick={handleClose} className="text-night-400 hover:text-night-100 ml-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Warning */}
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 text-sm text-red-300 space-y-1">
            <p className="font-semibold">Você está prestes a excluir permanentemente:</p>
            <ul className="list-disc list-inside space-y-0.5 text-red-400">
              <li>A estrutura <strong>&ldquo;{structureName}&rdquo;</strong></li>
              <li>Todos os grupos associados</li>
              <li>Todo o histórico de cliques e redirecionamentos</li>
              <li>Todas as mensagens agendadas desta estrutura</li>
              <li>Todos os dados de analytics</li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm text-night-200 mb-1.5">
              Para confirmar, digite <span className="font-mono font-semibold text-red-400">excluir</span> abaixo:
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="excluir"
              autoFocus
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-night-50 placeholder-night-500 bg-night-700 focus:outline-none focus:ring-2 transition-colors ${
                confirmed
                  ? 'border-red-500 ring-red-900/40 bg-red-900/20'
                  : 'border-night-600 focus:ring-red-900/40'
              }`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-400"
              disabled={!confirmed || loading}
              loading={loading}
              onClick={handleConfirm}
            >
              Excluir permanentemente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
