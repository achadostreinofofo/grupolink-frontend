'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { X, Clock } from 'lucide-react'
import type { Structure } from '@/types'

const INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 60]

const fieldClass =
  'w-full rounded-lg border border-night-600 bg-night-700 text-night-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 [color-scheme:dark]'

interface Props {
  structure: Structure
  onClose: () => void
  onSaved: (s: Structure) => void
}

export function ScheduleConfigModal({ structure, onClose, onSaved }: Props) {
  const [start, setStart]       = useState(structure.scheduleWindowStart)
  const [end, setEnd]           = useState(structure.scheduleWindowEnd)
  const [interval, setInterval] = useState(structure.scheduleIntervalMinutes)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const save = async () => {
    if (start >= end) { setError('A hora de início deve ser anterior à de fim.'); return }
    setSaving(true)
    setError('')
    try {
      const updated = await api.structures.updateScheduleConfig(structure.id, {
        scheduleWindowStart: start,
        scheduleWindowEnd: end,
        scheduleIntervalMinutes: interval,
      })
      onSaved(updated)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-night-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-night-50">Regras de agendamento</h2>
          </div>
          <button onClick={onClose} className="text-night-400 hover:text-night-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-night-400">
            Janela e intervalo dos horários disponíveis para <strong>agendar</strong> mensagens nesta estrutura.
            Não afeta o envio imediato.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-night-400 mb-1">Início</label>
              <input type="time" value={start} onChange={e => setStart(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs text-night-400 mb-1">Fim</label>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs text-night-400 mb-1">Intervalo</label>
              <select value={interval} onChange={e => setInterval(Number(e.target.value))} className={fieldClass}>
                {INTERVAL_OPTIONS.map(m => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button className="flex-1" onClick={save} loading={saving}>Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
