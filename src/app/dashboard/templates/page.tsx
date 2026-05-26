'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { MessageTemplate } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Pencil, Trash2, FileText, Image } from 'lucide-react'

const schema = z.object({
  name:     z.string().min(2, 'Nome obrigatório'),
  content:  z.string().min(1, 'Conteúdo obrigatório'),
  mediaUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<MessageTemplate | null>(null)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    api.templates.list().then(setTemplates).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset(); setShowForm(true) }
  const openEdit   = (t: MessageTemplate) => {
    setEditing(t)
    setValue('name', t.name)
    setValue('content', t.content)
    setValue('mediaUrl', t.mediaUrl ?? '')
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    setFormError('')
    try {
      const payload = { name: data.name, content: data.content, mediaUrl: data.mediaUrl || undefined }
      if (editing) await api.templates.update(editing.id, payload)
      else          await api.templates.create(payload)
      reset(); setShowForm(false); setEditing(null); load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar template')
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este template?')) return
    await api.templates.delete(id).catch(console.error)
    load()
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-night-50">Templates de Mensagem</h1>
          <p className="text-sm text-night-300 mt-1">Reutilize mensagens prontas ao criar agendamentos</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Novo template
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-brand-200">
          <CardHeader>
            <p className="text-sm font-semibold text-night-200">
              {editing ? 'Editar Template' : 'Novo Template'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nome do template" placeholder="Ex: Promoção Semanal" error={errors.name?.message} {...register('name')} />
              <div>
                <label className="text-sm font-medium text-night-200 block mb-1">Mensagem</label>
                <textarea
                  className="w-full rounded-lg border border-night-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] resize-y"
                  placeholder="Texto da mensagem. Use {{nome}}, {{produto}}, {{preco}} como variáveis."
                  {...register('content')}
                />
                {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
              </div>
              <Input label="URL de imagem (opcional)" placeholder="https://..." error={errors.mediaUrl?.message} {...register('mediaUrl')} />
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>}
              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>{editing ? 'Salvar alterações' : 'Criar template'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-night-700 rounded-xl animate-pulse" />)}</div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-14 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-night-300">Nenhum template criado</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <Card key={t.id}>
              <CardContent className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-night-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {t.mediaUrl ? <Image className="w-4 h-4 text-night-300" /> : <FileText className="w-4 h-4 text-night-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-night-50 text-sm">{t.name}</p>
                  <p className="text-xs text-night-300 mt-0.5 line-clamp-2">{t.content}</p>
                  {t.mediaUrl && <p className="text-xs text-blue-500 mt-0.5 truncate">{t.mediaUrl}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => onDelete(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
