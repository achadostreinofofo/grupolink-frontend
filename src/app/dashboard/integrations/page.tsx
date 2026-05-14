'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { WhatsappAccount } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2, ExternalLink, Smartphone } from 'lucide-react'

const schema = z.object({
  phoneNumberId: z.string().min(5, 'Phone Number ID obrigatório'),
  accessToken:   z.string().min(20, 'Access Token obrigatório'),
})

type FormData = z.infer<typeof schema>

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<WhatsappAccount[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    api.whatsapp.list()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onConnect = async (data: FormData) => {
    setFormError('')
    try {
      await api.whatsapp.connect(data)
      reset()
      setShowForm(false)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao conectar conta')
    }
  }

  const onDisconnect = async (id: string) => {
    if (!confirm('Desconectar esta conta WhatsApp?')) return
    await api.whatsapp.disconnect(id).catch(console.error)
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrações WhatsApp</h1>
          <p className="text-sm text-gray-500 mt-1">
            Conecte sua conta WhatsApp Business para envio de mensagens
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Adicionar conta
        </Button>
      </div>

      {/* Instruções de configuração */}
      <Card className="mb-6 border-blue-100 bg-blue-50">
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">Como conectar sua conta</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Acesse o <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">Meta Developer Console <ExternalLink className="w-3 h-3" /></a></li>
            <li>Crie um App com produto <strong>WhatsApp Business</strong></li>
            <li>Copie o <strong>Phone Number ID</strong> e o <strong>Access Token permanente</strong></li>
            <li>Configure o webhook apontando para: <code className="bg-blue-100 px-1 rounded text-xs">/api/webhooks/whatsapp</code></li>
          </ol>
        </CardContent>
      </Card>

      {/* Formulário de conexão */}
      {showForm && (
        <Card className="mb-6 border-brand-200">
          <CardHeader>
            <p className="text-sm font-semibold text-gray-700">Nova Conta WhatsApp Business</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onConnect)} className="space-y-4">
              <Input
                label="Phone Number ID"
                placeholder="Ex: 123456789012345"
                error={errors.phoneNumberId?.message}
                {...register('phoneNumberId')}
              />
              <div>
                <Input
                  label="Access Token (permanente)"
                  type="password"
                  placeholder="EAAxxxxxx..."
                  error={errors.accessToken?.message}
                  {...register('accessToken')}
                />
                <p className="text-xs text-gray-400 mt-1">
                  O token é armazenado de forma segura e nunca exibido novamente.
                </p>
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>Conectar conta</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de contas */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Smartphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma conta conectada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map(acc => (
            <Card key={acc.id}>
              <CardContent className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">
                      {acc.displayName ?? 'Conta WhatsApp'}
                    </p>
                    <Badge variant="green">Conectado</Badge>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {acc.displayPhone ?? acc.phoneNumberId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDisconnect(acc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
