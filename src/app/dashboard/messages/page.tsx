'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { MessageTemplate, ScheduledMessage, Structure } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, MessageSquare, X, Image, Calendar, Clock } from 'lucide-react'

const schema = z.object({
  title:       z.string().min(2, 'Título obrigatório'),
  content:     z.string().min(1, 'Mensagem obrigatória'),
  mediaUrl:    z.string().url('URL inválida').optional().or(z.literal('')),
  structureId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Data obrigatória'),
})

type FormData = z.infer<typeof schema>

function statusInfo(status: ScheduledMessage['status']): { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' } {
  return {
    PENDING:   { label: 'Agendado',  variant: 'yellow' },
    SENT:      { label: 'Enviado',   variant: 'green' },
    FAILED:    { label: 'Falhou',    variant: 'red' },
    CANCELLED: { label: 'Cancelado', variant: 'gray' },
  }[status]
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function minDateTimeLocal() {
  const d = new Date(Date.now() + 5 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

export default function MessagesPage() {
  const [messages, setMessages]     = useState<ScheduledMessage[]>([])
  const [structures, setStructures] = useState<Structure[]>([])
  const [templates, setTemplates]   = useState<MessageTemplate[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [formError, setFormError]   = useState('')

  // Modal de reagendamento
  const [reschedulingMsg, setReschedulingMsg]   = useState<ScheduledMessage | null>(null)
  const [rescheduleDate, setRescheduleDate]     = useState('')
  const [rescheduleLoading, setRescheduleLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const applyTemplate = (id: string) => {
    const t = templates.find(t => t.id === id)
    if (!t) return
    setValue('content', t.content)
    setValue('mediaUrl', t.mediaUrl ?? '')
    setValue('title', t.name)
  }

  const load = () => {
    setLoading(true)
    Promise.all([api.messages.list(), api.structures.list(), api.templates.list()])
      .then(([msgs, structs, tmpl]) => { setMessages(msgs); setStructures(structs); setTemplates(tmpl) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onCreate = async (data: FormData) => {
    setFormError('')
    try {
      await api.messages.create({
        title:       data.title,
        content:     data.content,
        mediaUrl:    data.mediaUrl || undefined,
        structureId: data.structureId || undefined,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      })
      reset()
      setShowForm(false)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao criar mensagem')
    }
  }

  const onCancel = async (id: string) => {
    if (!confirm('Cancelar este agendamento?')) return
    await api.messages.cancel(id).catch(console.error)
    load()
  }

  const onReschedule = async () => {
    if (!reschedulingMsg || !rescheduleDate) return
    setRescheduleLoading(true)
    try {
      await api.messages.update(reschedulingMsg.id, {
        title:       reschedulingMsg.title,
        content:     reschedulingMsg.content,
        mediaUrl:    reschedulingMsg.mediaUrl ?? undefined,
        scheduledAt: new Date(rescheduleDate).toISOString(),
      })
      setReschedulingMsg(null)
      setRescheduleDate('')
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao reagendar mensagem')
    } finally {
      setRescheduleLoading(false)
    }
  }

  const closeModal = () => {
    setReschedulingMsg(null)
    setRescheduleDate('')
  }

  const pending = messages.filter(m => m.status === 'PENDING')
  const history = messages.filter(m => m.status !== 'PENDING')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens Agendadas</h1>
          <p className="text-sm text-gray-500 mt-1">Programe envios em massa para seus grupos WhatsApp</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Nova mensagem
        </Button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card className="mb-6 border-brand-200">
          <CardHeader>
            <p className="text-sm font-semibold text-gray-700">Agendar Nova Mensagem</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              {templates.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Usar template (opcional)</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onChange={e => applyTemplate(e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Selecionar template…</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <Input
                label="Título"
                placeholder="Ex: Promoção de segunda-feira"
                error={errors.title?.message}
                {...register('title')}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Mensagem</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px] resize-y"
                  placeholder="Texto da mensagem (emojis são suportados ✅)"
                  {...register('content')}
                />
                {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="URL de imagem (opcional)"
                    placeholder="https://..."
                    error={errors.mediaUrl?.message}
                    {...register('mediaUrl')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estrutura de destino</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register('structureId')}
                  >
                    <option value="">Todas as estruturas</option>
                    {structures.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                type="datetime-local"
                label="Enviar em"
                min={minDateTimeLocal()}
                error={errors.scheduledAt?.message}
                {...register('scheduledAt')}
              />

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>
                  <Calendar className="w-4 h-4" />
                  Agendar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mensagens pendentes */}
      {loading ? (
        <div className="space-y-3 mb-6">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-600 mb-3">
                Agendadas ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(msg => (
                  <Card key={msg.id} className="border-yellow-100">
                    <CardContent className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {msg.mediaUrl ? <Image className="w-4 h-4 text-yellow-600" /> : <MessageSquare className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{msg.title}</p>
                          <Badge variant="yellow">Agendado</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.content}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>Envio: {formatDateTime(msg.scheduledAt!)}</span>
                          {msg.structureName && <span>· {msg.structureName}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                        onClick={() => onCancel(msg.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Histórico */}
          {history.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3">Histórico</h2>
              <div className="space-y-2">
                {history.map(msg => {
                  const { label, variant } = statusInfo(msg.status)
                  return (
                    <Card key={msg.id} className="opacity-80">
                      <CardContent className="flex items-center gap-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 text-sm">{msg.title}</p>
                            <Badge variant={variant}>{label}</Badge>
                          </div>
                          {msg.errorMessage && (
                            <p className="text-xs text-red-500 mt-0.5">{msg.errorMessage}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {msg.executedAt ? `Executado: ${formatDateTime(msg.executedAt)}` : msg.scheduledAt ? formatDateTime(msg.scheduledAt) : '—'}
                            {msg.structureName && ` · ${msg.structureName}`}
                          </p>
                        </div>
                        {msg.status === 'SENT' && (
                          <button
                            title="Reagendar mensagem"
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                            onClick={() => { setReschedulingMsg(msg); setRescheduleDate('') }}
                          >
                            <Clock className="w-5 h-5 text-yellow-500" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <Card>
              <CardContent className="py-14 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">Nenhuma mensagem agendada</p>
                <p className="text-xs text-gray-400">Crie seu primeiro agendamento acima</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de reagendamento */}
      {reschedulingMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Reagendar envio</h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-1">Mensagem</p>
            <p className="text-sm font-medium text-gray-800 mb-5 truncate">{reschedulingMsg.title}</p>

            <label className="text-sm font-medium text-gray-700 block mb-1.5">Nova data e hora de envio</label>
            <input
              type="datetime-local"
              min={minDateTimeLocal()}
              value={rescheduleDate}
              onChange={e => setRescheduleDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-6"
            />

            <div className="flex gap-2">
              <Button
                className="flex-1"
                loading={rescheduleLoading}
                disabled={!rescheduleDate}
                onClick={onReschedule}
              >
                <Calendar className="w-4 h-4" />
                Agendar
              </Button>
              <Button variant="ghost" onClick={closeModal}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
