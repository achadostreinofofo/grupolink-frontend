'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BookmarkCheck, CalendarClock, Send, X } from 'lucide-react'

export type SaveAction = 'draft' | 'schedule' | 'send_now'

interface Props {
  open: boolean
  saving: boolean
  onClose: () => void
  onConfirm: (action: SaveAction, scheduledAt?: string) => void
}

function minDateTime() {
  const d = new Date(Date.now() + 5 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

export function SaveMessageModal({ open, saving, onClose, onConfirm }: Props) {
  const [selected, setSelected]   = useState<SaveAction | null>(null)
  const [scheduleAt, setScheduleAt] = useState('')
  const [scheduleErr, setScheduleErr] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    if (!selected) return

    if (selected === 'schedule') {
      if (!scheduleAt) { setScheduleErr('Informe a data e hora'); return }
      if (new Date(scheduleAt) <= new Date()) { setScheduleErr('A data deve ser futura'); return }
    }

    onConfirm(selected, selected === 'schedule' ? scheduleAt : undefined)
  }

  const options: { id: SaveAction; icon: React.ReactNode; title: string; desc: string; color: string }[] = [
    {
      id: 'draft',
      icon: <BookmarkCheck className="w-5 h-5" />,
      title: 'Salvar rascunho',
      desc: 'Guarda a mensagem para você editar e enviar quando quiser.',
      color: 'border-gray-200 hover:border-gray-400 data-[sel=true]:border-gray-600 data-[sel=true]:bg-gray-50',
    },
    {
      id: 'schedule',
      icon: <CalendarClock className="w-5 h-5" />,
      title: 'Agendar envio',
      desc: 'Escolhe uma data e hora para o envio automático.',
      color: 'border-blue-100 hover:border-blue-400 data-[sel=true]:border-blue-500 data-[sel=true]:bg-blue-50',
    },
    {
      id: 'send_now',
      icon: <Send className="w-5 h-5" />,
      title: 'Enviar agora',
      desc: 'Dispara a mensagem imediatamente para todos os grupos da estrutura.',
      color: 'border-brand-100 hover:border-brand-400 data-[sel=true]:border-brand-500 data-[sel=true]:bg-brand-50',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">O que deseja fazer?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* options */}
        <div className="p-4 space-y-2.5">
          {options.map(opt => (
            <button
              key={opt.id}
              data-sel={selected === opt.id}
              onClick={() => { setSelected(opt.id); setScheduleErr('') }}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${opt.color}`}
            >
              <span className={`mt-0.5 flex-shrink-0 ${selected === opt.id ? 'text-gray-900' : 'text-gray-400'}`}>
                {opt.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${selected === opt.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {opt.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}

          {/* datetime picker (only when schedule selected) */}
          {selected === 'schedule' && (
            <div className="px-1 pt-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data e hora de envio
              </label>
              <input
                type="datetime-local"
                min={minDateTime()}
                value={scheduleAt}
                onChange={e => { setScheduleAt(e.target.value); setScheduleErr('') }}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {scheduleErr && <p className="text-xs text-red-500 mt-1">{scheduleErr}</p>}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!selected || saving}
            loading={saving}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
