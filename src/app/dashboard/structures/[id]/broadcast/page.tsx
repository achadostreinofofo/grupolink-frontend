'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { BroadcastStatusDetail, Group, Structure } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, CheckCircle, Loader2, MessageSquare, Send, XCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  messageType: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
  content: z.string().min(1, 'Mensagem obrigatória'),
  mediaUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

function BroadcastProgress({ broadcast }: { broadcast: BroadcastStatusDetail }) {
  const pct = broadcast.totalGroups > 0
    ? Math.round((broadcast.groupsProcessed / broadcast.totalGroups) * 100)
    : 0

  const isCompleted = broadcast.status === 'COMPLETED'
  const isFailed    = broadcast.status === 'FAILED'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {isCompleted ? 'Envio concluído' : isFailed ? 'Falha no envio' : 'Enviando mensagens...'}
        </span>
        <span className="text-gray-500">{pct}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isCompleted ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-brand-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>{broadcast.groupsSuccessful} enviadas</span>
        </div>
        {broadcast.groupsFailed > 0 && (
          <div className="flex items-center gap-1 text-red-500">
            <XCircle className="w-4 h-4" />
            <span>{broadcast.groupsFailed} falhas</span>
          </div>
        )}
        {!isCompleted && !isFailed && (
          <div className="flex items-center gap-1 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{broadcast.totalGroups - broadcast.groupsProcessed} restantes</span>
          </div>
        )}
      </div>
    </div>
  )
}

function GroupSelector({
  groups,
  selected,
  onChange,
}: {
  groups: Group[]
  selected: Set<string>
  onChange: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {groups.map(g => (
        <label key={g.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-brand-200 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={selected.has(g.id)}
            onChange={() => onChange(g.id)}
            className="accent-teal-500"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
            <p className="text-xs text-gray-400">
              {g.memberCount}/{g.maxMembers} membros · {Math.round(g.capacityPercentage * 100)}%
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            g.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {g.status === 'ACTIVE' ? 'Ativo' : g.status}
          </span>
        </label>
      ))}
    </div>
  )
}

export default function BroadcastPage() {
  const { id: structureId } = useParams<{ id: string }>()
  const router = useRouter()

  const [structure, setStructure]       = useState<Structure | null>(null)
  const [loading, setLoading]           = useState(true)
  const [selectedGroups, setSelected]   = useState<Set<string>>(new Set())
  const [broadcast, setBroadcast]       = useState<BroadcastStatusDetail | null>(null)
  const [error, setError]               = useState('')
  const [sendToAll, setSendToAll]       = useState(true)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { messageType: 'TEXT' },
  })

  const messageType = watch('messageType')

  useEffect(() => {
    api.structures.get(structureId)
      .then(s => {
        setStructure(s)
        setSelected(new Set(s.groups.filter(g => g.status === 'ACTIVE').map(g => g.id)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [structureId])

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const pollBroadcast = (broadcastId: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.broadcast.getStatus(structureId, broadcastId)
        setBroadcast(status)
        if (status.status === 'COMPLETED' || status.status === 'FAILED') stopPolling()
      } catch {
        stopPolling()
      }
    }, 1500)
  }

  useEffect(() => () => stopPolling(), [])

  const toggleGroup = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (!structure) return
    const activeIds = structure.groups.filter(g => g.status === 'ACTIVE').map(g => g.id)
    if (selectedGroups.size === activeIds.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(activeIds))
    }
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    setBroadcast(null)
    try {
      const res = await api.broadcast.send(structureId, {
        messageType: data.messageType,
        content: data.content,
        mediaUrl: data.mediaUrl || undefined,
        groupIds: sendToAll ? undefined : Array.from(selectedGroups),
      })
      setBroadcast({
        broadcastId: res.broadcastId,
        status: res.status as BroadcastStatusDetail['status'],
        totalGroups: res.totalGroups,
        groupsProcessed: 0,
        groupsSuccessful: 0,
        groupsFailed: 0,
        createdAt: new Date().toISOString(),
      })
      pollBroadcast(res.broadcastId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar mensagem')
    }
  }

  const activeGroups = structure?.groups.filter(g => g.status === 'ACTIVE') ?? []

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/structures/${structureId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transmitir Mensagem</h1>
          <p className="text-sm text-gray-500">
            {structure ? structure.name : 'Carregando...'} · Enviar para todos os grupos
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Progress card */}
          {broadcast && (
            <Card className={`border-2 ${
              broadcast.status === 'COMPLETED' ? 'border-green-200 bg-green-50' :
              broadcast.status === 'FAILED'    ? 'border-red-200 bg-red-50' :
              'border-brand-200 bg-brand-50'
            }`}>
              <CardContent className="py-4">
                <BroadcastProgress broadcast={broadcast} />
              </CardContent>
            </Card>
          )}

          {/* Message form */}
          {(!broadcast || broadcast.status === 'COMPLETED' || broadcast.status === 'FAILED') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Card>
                <CardHeader>
                  <p className="text-sm font-medium text-gray-700">Tipo de Mensagem</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {(['TEXT', 'IMAGE'] as const).map(type => (
                      <label key={type} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        messageType === type
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}>
                        <input type="radio" value={type} {...register('messageType')} className="sr-only" />
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">{type === 'TEXT' ? 'Texto' : 'Imagem'}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <p className="text-sm font-medium text-gray-700">Mensagem</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {messageType === 'IMAGE' ? 'Legenda da imagem' : 'Conteúdo'}
                    </label>
                    <textarea
                      {...register('content')}
                      rows={4}
                      placeholder={messageType === 'TEXT'
                        ? 'Digite sua mensagem aqui...'
                        : 'Legenda para a imagem (opcional)'}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                    />
                    {errors.content && (
                      <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                    )}
                  </div>

                  {messageType === 'IMAGE' && (
                    <Input
                      label="URL da imagem"
                      placeholder="https://..."
                      error={errors.mediaUrl?.message}
                      {...register('mediaUrl')}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Group selection */}
              {activeGroups.length > 1 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Grupos de destino</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Selecionar manualmente</span>
                        <button
                          type="button"
                          onClick={() => setSendToAll(v => !v)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${sendToAll ? 'bg-brand-500' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${sendToAll ? 'translate-x-4' : ''}`} />
                        </button>
                        <span className={sendToAll ? 'text-brand-600 font-medium' : 'text-gray-400'}>Todos</span>
                      </div>
                    </div>
                  </CardHeader>
                  {!sendToAll && (
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400">{selectedGroups.size} de {activeGroups.length} selecionados</span>
                        <button type="button" className="text-xs text-brand-600 hover:underline" onClick={toggleAll}>
                          {selectedGroups.size === activeGroups.length ? 'Desmarcar todos' : 'Selecionar todos'}
                        </button>
                      </div>
                      <GroupSelector groups={activeGroups} selected={selectedGroups} onChange={toggleGroup} />
                    </CardContent>
                  )}
                </Card>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!sendToAll && selectedGroups.size === 0}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {sendToAll
                    ? `Enviar para todos os grupos (${activeGroups.length})`
                    : `Enviar para ${selectedGroups.size} grupo(s)`}
                </Button>
                <Link href={`/dashboard/structures/${structureId}`}>
                  <Button type="button" variant="secondary">Cancelar</Button>
                </Link>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
