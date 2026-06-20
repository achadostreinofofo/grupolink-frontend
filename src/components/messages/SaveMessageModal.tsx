'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BookmarkCheck, CalendarClock, Send, X } from 'lucide-react'
import { ScheduleSlotPicker } from './ScheduleSlotPicker'

export type SaveAction = 'draft' | 'schedule' | 'send_now'

interface Props {
  open: boolean
  saving: boolean
  structureId: string
  onClose: () => void
  onConfirm: (action: SaveAction, scheduledAt?: string) => void
}

function formatSlot(datetime: string): string {
  // "2026-06-20T08:05" → "20/06 às 08:05"
  const [d, t] = datetime.split('T')
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y} às ${t.slice(0, 5)}`
}

export function SaveMessageModal({ open, saving, structureId, onClose, onConfirm }: Props) {
  const [selected, setSelected]     = useState<SaveAction | null>(null)
  const [scheduleAt, setScheduleAt] = useState('')
  const [scheduleErr, setScheduleErr] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    if (!selected) return
    if (selected === 'schedule' && !scheduleAt) {
      setScheduleErr('Escolha um horário disponível')
      return
    }
    onConfirm(selected, selected === 'schedule' ? scheduleAt : undefined)
  }

  const options: { id: SaveAction; icon: React.ReactNode; title: string; desc: string; color: string }[] = [
    {
      id: 'draft',
      icon: <BookmarkCheck className="w-5 h-5" />,
      title: 'Salvar rascunho',
      desc: 'Guarda a mensagem para você editar e enviar quando quiser.',
      color: 'border-night-600 hover:border-night-400 data-[sel=true]:border-night-300 data-[sel=true]:bg-night-700',
    },
    {
      id: 'schedule',
      icon: <CalendarClock className="w-5 h-5" />,
      title: 'Agendar envio',
      desc: 'Escolhe uma data e hora para o envio automático.',
      color: 'border-night-600 hover:border-blue-500 data-[sel=true]:border-blue-500 data-[sel=true]:bg-blue-900/20',
    },
    {
      id: 'send_now',
      icon: <Send className="w-5 h-5" />,
      title: 'Enviar agora',
      desc: 'Dispara a mensagem imediatamente para todos os grupos da estrutura.',
      color: 'border-night-600 hover:border-brand-600 data-[sel=true]:border-brand-500 data-[sel=true]:bg-brand-900/20',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-night-800 border border-night-600 rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-night-600">
          <h2 className="text-base font-semibold text-night-50">O que deseja fazer?</h2>
          <button onClick={onClose} className="text-night-400 hover:text-night-100">
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
              <span className={`mt-0.5 flex-shrink-0 ${selected === opt.id ? 'text-night-50' : 'text-night-300'}`}>
                {opt.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${selected === opt.id ? 'text-night-50' : 'text-night-100'}`}>
                  {opt.title}
                </p>
                <p className="text-xs text-night-300 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}

          {selected === 'schedule' && (
            <div className="px-1 pt-1">
              <label className="block text-sm font-medium text-night-200 mb-2">
                Escolha o dia e um horário disponível
              </label>
              <ScheduleSlotPicker
                structureId={structureId}
                value={scheduleAt}
                onSelect={dt => { setScheduleAt(dt); setScheduleErr('') }}
              />
              {scheduleAt && (
                <p className="text-xs text-brand-400 mt-2">Agendado para {formatSlot(scheduleAt)}</p>
              )}
              {scheduleErr && <p className="text-xs text-red-400 mt-1">{scheduleErr}</p>}
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
