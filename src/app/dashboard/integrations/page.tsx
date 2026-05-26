'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { WebSessionStatus, WhatsappAccount } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  AlertTriangle, CheckCircle, ExternalLink, Plus, QrCode,
  RefreshCw, Smartphone, Trash2, Wifi, WifiOff,
} from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  phoneNumberId: z.string().min(5, 'Phone Number ID obrigatório'),
  accessToken:   z.string().min(20, 'Access Token obrigatório'),
})

type FormData = z.infer<typeof schema>

type Tab = 'api' | 'qrcode'

export default function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>('qrcode')

  // ── API (Meta Business) state ──
  const [accounts, setAccounts]     = useState<WhatsappAccount[]>([])
  const [loadingApi, setLoadingApi] = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [formError, setFormError]   = useState('')

  // ── WhatsApp Web (QR) state ──
  const [sessions, setSessions]           = useState<WebSessionStatus[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [reconnectingId, setReconnectingId]   = useState<string | null>(null)
  const [liveStatuses, setLiveStatuses]       = useState<Record<string, string>>({})

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const loadApiAccounts = () => {
    setLoadingApi(true)
    api.whatsapp.list()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoadingApi(false))
  }

  const loadSessions = () => {
    setLoadingSessions(true)
    api.whatsappWeb.listSessions()
      .then(list => {
        setSessions(list)
        // Verifica status live de cada sessão em background
        list.forEach(s => {
          api.whatsappWeb.getStatus(s.sessionId)
            .then(live => setLiveStatuses(prev => ({ ...prev, [s.sessionId]: live.status })))
            .catch(() => {})
        })
      })
      .catch(console.error)
      .finally(() => setLoadingSessions(false))
  }

  const getDisplayStatus = (session: WebSessionStatus) => {
    const live = liveStatuses[session.sessionId] ?? session.status
    if (live === 'AUTHENTICATED') return 'AUTHENTICATED'
    if (session.phone) return 'EXPIRED'   // tinha número → sessão expirou
    return 'WAITING_SCAN'
  }

  useEffect(() => {
    loadApiAccounts()
    loadSessions()
  }, [])

  const onConnect = async (data: FormData) => {
    setFormError('')
    try {
      await api.whatsapp.connect(data)
      reset()
      setShowForm(false)
      loadApiAccounts()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao conectar conta')
    }
  }

  const onDisconnect = async (id: string) => {
    if (!confirm('Desconectar esta conta WhatsApp?')) return
    await api.whatsapp.disconnect(id).catch(console.error)
    loadApiAccounts()
  }

  const onDisconnectSession = async (sessionId: string) => {
    if (!confirm('Desconectar esta sessão WhatsApp Web?')) return
    await api.whatsappWeb.disconnect(sessionId).catch(console.error)
    loadSessions()
  }

  const onReconnectSession = async (sessionId: string) => {
    setReconnectingId(sessionId)
    try {
      await api.whatsappWeb.reconnect(sessionId)
      loadSessions()
    } catch (e) {
      console.error(e)
    } finally {
      setReconnectingId(null)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-night-50">Integrações WhatsApp</h1>
          <p className="text-sm text-night-300 mt-1">
            Conecte sua conta WhatsApp para criação de grupos e envio de mensagens
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-night-700 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('qrcode')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'qrcode' ? 'bg-night-700 text-night-50 shadow-sm' : 'text-night-300 hover:text-night-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          WhatsApp Web (QR Code)
        </button>
        <button
          onClick={() => setTab('api')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'api' ? 'bg-night-700 text-night-50 shadow-sm' : 'text-night-300 hover:text-night-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Meta Business API
        </button>
      </div>

      {/* ── WhatsApp Web (QR) Tab ── */}
      {tab === 'qrcode' && (
        <div className="space-y-4">
          <Card className="border-brand-100 bg-brand-50">
            <CardContent className="py-4">
              <p className="text-sm font-semibold text-brand-800 mb-1">Conexão via QR Code</p>
              <p className="text-sm text-brand-700">
                Conecte qualquer número WhatsApp escaneando um QR Code, da mesma forma que o WhatsApp Web.
                Permite criar grupos e enviar mensagens em massa para suas estruturas.
              </p>
            </CardContent>
          </Card>

          {loadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-night-700 rounded-xl animate-pulse" />)}
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <QrCode className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-night-300 mb-4">Nenhuma sessão ativa</p>
                <Link href="/dashboard/whatsapp/connect">
                  <Button>
                    <QrCode className="w-4 h-4 mr-1" />
                    Conectar via QR Code
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {sessions.map(session => {
                  const displayStatus = getDisplayStatus(session)
                  const isConnected   = displayStatus === 'AUTHENTICATED'
                  const isExpired     = displayStatus === 'EXPIRED'

                  return (
                    <Card key={session.sessionId}>
                      <CardContent className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isConnected ? 'bg-brand-100' : isExpired ? 'bg-amber-50' : 'bg-night-700'
                        }`}>
                          {isConnected
                            ? <Wifi className="w-5 h-5 text-brand-600" />
                            : <WifiOff className={`w-5 h-5 ${isExpired ? 'text-amber-400' : 'text-night-400'}`} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {session.phone
                              ? <p className="font-medium text-night-50 text-sm">+{session.phone}</p>
                              : <p className="font-medium text-night-400 text-sm">Aguardando autenticação</p>
                            }
                            {isConnected && (
                              <Badge variant="green"><CheckCircle className="w-3 h-3 mr-1 inline" />Conectado</Badge>
                            )}
                            {isExpired && (
                              <Badge variant="yellow"><AlertTriangle className="w-3 h-3 mr-1 inline" />Expirada</Badge>
                            )}
                            {!isConnected && !isExpired && (
                              <Badge variant="gray">Aguardando scan</Badge>
                            )}
                          </div>
                          <p className="text-xs text-night-400 font-mono mt-0.5 truncate">
                            {session.sessionId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {isExpired && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => onReconnectSession(session.sessionId)}
                              disabled={reconnectingId === session.sessionId}
                              title="Reconectar sessão"
                            >
                              <RefreshCw className={`w-4 h-4 ${reconnectingId === session.sessionId ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDisconnectSession(session.sessionId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Link href="/dashboard/whatsapp/connect?new=true">
                <Button variant="secondary" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar nova sessão
                </Button>
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Meta Business API Tab ── */}
      {tab === 'api' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4" />
              Adicionar conta
            </Button>
          </div>

          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="py-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">Como conectar via Meta API</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>
                  Acesse o{' '}
                  <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    Meta Developer Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Crie um App com produto <strong>WhatsApp Business</strong></li>
                <li>Copie o <strong>Phone Number ID</strong> e o <strong>Access Token permanente</strong></li>
                <li>Configure o webhook apontando para: <code className="bg-blue-100 px-1 rounded text-xs">/api/webhooks/whatsapp</code></li>
              </ol>
            </CardContent>
          </Card>

          {showForm && (
            <Card className="border-brand-200">
              <CardHeader>
                <p className="text-sm font-semibold text-night-200">Nova Conta WhatsApp Business</p>
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
                    <p className="text-xs text-night-400 mt-1">
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

          {loadingApi ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-night-700 rounded-xl animate-pulse" />)}
            </div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Smartphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-night-300">Nenhuma conta conectada ainda</p>
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
                        <p className="font-medium text-night-50 text-sm">
                          {acc.displayName ?? 'Conta WhatsApp'}
                        </p>
                        <Badge variant="green">Conectado</Badge>
                      </div>
                      <p className="text-xs text-night-400 font-mono mt-0.5">
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
      )}
    </div>
  )
}
