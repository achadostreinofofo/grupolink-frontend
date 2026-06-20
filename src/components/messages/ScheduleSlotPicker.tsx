'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { ScheduleSlot } from '@/types'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
function startOfDay(d: Date): Date { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }

interface Props {
  structureId: string
  value?: string                       // datetime selecionado ("yyyy-MM-ddTHH:mm")
  onSelect: (datetime: string) => void
}

export function ScheduleSlotPicker({ structureId, value, onSelect }: Props) {
  const today = startOfDay(new Date())
  const [month, setMonth]           = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slots, setSlots]           = useState<ScheduleSlot[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!selectedDay) return
    setLoading(true); setError(''); setSlots([])
    api.structures.scheduleSlots(structureId, ymd(selectedDay))
      .then(setSlots)
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar horários'))
      .finally(() => setLoading(false))
  }, [selectedDay, structureId])

  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth  = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))

  const canGoPrev = month > new Date(today.getFullYear(), today.getMonth(), 1)

  return (
    <div className="space-y-3">
      {/* mini-calendário */}
      <div className="bg-night-700 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" disabled={!canGoPrev}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="p-1 text-night-300 disabled:opacity-30 hover:text-night-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-night-100">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
          <button type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="p-1 text-night-300 hover:text-night-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w, i) => <span key={i} className="text-[10px] text-night-500 py-1">{w}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const past  = d < today
            const isSel = selectedDay != null && ymd(d) === ymd(selectedDay)
            return (
              <button key={i} type="button" disabled={past} onClick={() => setSelectedDay(d)}
                className={`text-xs h-8 rounded-lg transition-colors ${
                  isSel ? 'bg-brand-500 text-night-900 font-semibold'
                  : past ? 'text-night-600 cursor-not-allowed'
                  : 'text-night-200 hover:bg-night-600'
                }`}>{d.getDate()}</button>
            )
          })}
        </div>
      </div>

      {/* grade de horários do dia */}
      {selectedDay && (
        <div>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-night-400" /></div>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-3">{error}</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-night-400 text-center py-3">Nenhum horário configurado para esta estrutura.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {slots.map(s => {
                  const isSel = value === s.datetime
                  return (
                    <button key={s.datetime} type="button" disabled={!s.available}
                      onClick={() => onSelect(s.datetime)}
                      title={s.status === 'TAKEN' ? 'Já agendado' : s.status === 'PAST' ? 'Horário passado' : ''}
                      className={`text-xs py-1.5 rounded-lg border transition-colors ${
                        isSel ? 'bg-brand-500 text-night-900 border-brand-500 font-semibold'
                        : s.status === 'AVAILABLE' ? 'border-night-600 text-night-100 hover:border-brand-500'
                        : s.status === 'TAKEN' ? 'border-night-700 bg-night-700 text-night-500 line-through cursor-not-allowed'
                        : 'border-night-700 text-night-600 cursor-not-allowed'
                      }`}>{s.time}</button>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-2 text-[10px] text-night-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" />Disponível</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-night-600" />Ocupado / passado</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
