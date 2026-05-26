'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { ShortLink } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Copy, Plus, Trash2, Link2, ToggleLeft, ToggleRight } from 'lucide-react'

const schema = z.object({
  targetUrl: z.string().url('URL inválida (inclua https://)'),
  code:      z.string().regex(/^[a-z0-9-]*$/, 'Use apenas letras, números e hífens').optional().or(z.literal('')),
  title:     z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function LinksPage() {
  const [links, setLinks]       = useState<ShortLink[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [copied, setCopied]     = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    api.links.list()
      .then(setLinks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onCreate = async (data: FormData) => {
    setFormError('')
    try {
      await api.links.create({
        targetUrl: data.targetUrl,
        code:      data.code || undefined,
        title:     data.title || undefined,
      })
      reset()
      setShowForm(false)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao criar link')
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este link?')) return
    await api.links.delete(id).catch(console.error)
    load()
  }

  const onToggle = async (id: string) => {
    await api.links.toggle(id).catch(console.error)
    load()
  }

  const copyLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-night-50">Encurtador de Links</h1>
          <p className="text-sm text-night-300 mt-1">
            Crie links curtos rastreáveis como <code className="bg-night-700 px-1 rounded text-xs">/s/promos-ml</code>
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Novo link
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="mb-6 border-brand-200">
          <CardHeader>
            <p className="text-sm font-semibold text-night-200">Criar Link Curto</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <Input
                label="URL de destino"
                placeholder="https://mercadolivre.com.br/produto/..."
                error={errors.targetUrl?.message}
                {...register('targetUrl')}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Slug personalizado (opcional)"
                    placeholder="promos-ml"
                    error={errors.code?.message}
                    {...register('code')}
                  />
                  <p className="text-xs text-night-400 mt-1">Deixe em branco para gerar automaticamente</p>
                </div>
                <Input
                  label="Título (opcional)"
                  placeholder="Promoções Mercado Livre"
                  {...register('title')}
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>Criar link</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de links */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-night-700 rounded-xl animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Link2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-night-300 mb-1">Nenhum link criado ainda</p>
            <p className="text-xs text-night-400">Crie links curtos rastreáveis para seus anúncios</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <Card key={link.id} className={!link.active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-brand-700">{link.shortUrl}</span>
                    <Badge variant={link.active ? 'green' : 'gray'}>
                      {link.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {link.title && (
                      <span className="text-xs text-night-300">{link.title}</span>
                    )}
                  </div>
                  <p className="text-xs text-night-400 truncate mt-0.5">{link.targetUrl}</p>
                </div>

                <div className="flex items-center gap-1 text-sm text-night-300 flex-shrink-0">
                  <span className="font-semibold text-night-200">{link.clicks.toLocaleString('pt-BR')}</span>
                  <span className="text-xs">cliques</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => copyLink(link.shortUrl, link.id)}>
                    <Copy className="w-3.5 h-3.5" />
                    {copied === link.id ? 'Copiado!' : ''}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onToggle(link.id)}>
                    {link.active
                      ? <ToggleRight className="w-4 h-4 text-brand-600" />
                      : <ToggleLeft className="w-4 h-4 text-night-400" />
                    }
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => onDelete(link.id)}
                  >
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
