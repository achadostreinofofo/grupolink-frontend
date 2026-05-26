import type { UtmEntry } from '@/types'

interface UtmTableProps {
  title: string
  rows: UtmEntry[]
}

export function UtmTable({ title, rows }: UtmTableProps) {
  if (rows.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-night-300 mb-2">{title}</p>
        <p className="text-xs text-night-400 italic">Sem dados com UTM neste período</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-night-300 mb-2">{title}</p>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-night-200 font-medium truncate max-w-[60%]">{row.label}</span>
              <span className="text-night-300 flex-shrink-0 ml-2">
                {row.clicks.toLocaleString('pt-BR')} <span className="text-night-400">({row.percentage}%)</span>
              </span>
            </div>
            <div className="w-full bg-night-700 rounded-full h-1.5">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all"
                style={{ width: `${row.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
