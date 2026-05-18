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
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Excluir estrutura</h2>
              <p className="text-xs text-gray-500 mt-0.5">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          {!loading && (
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 ml-2">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 space-y-1">
            <p className="font-semibold">Você está prestes a excluir permanentemente:</p>
            <ul className="list-disc list-inside space-y-0.5 text-red-600">
              <li>A estrutura <strong>"{structureName}"</strong></li>
              <li>Todos os grupos associados</li>
              <li>Todo o histórico de cliques e redirecionamentos</li>
              <li>Todas as mensagens agendadas desta estrutura</li>
              <li>Todos os dados de analytics</li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Para confirmar, digite <span className="font-mono font-semibold text-red-600">excluir</span> abaixo:
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="excluir"
              autoFocus
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                confirmed
                  ? 'border-red-400 ring-red-200 bg-red-50'
                  : 'border-gray-200 focus:ring-red-200'
              }`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
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
