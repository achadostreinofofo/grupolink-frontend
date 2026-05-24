'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, ArrowLeft, CheckCircle, RefreshCw, Smartphone, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'

const POLL_INTERVAL = 2000   // 2 s
const QR_TTL       = 60      // seconds before QR expires

function ConnectWhatsappWebContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceNewSession = searchParams.get('new') === 'true'

  const [sessionId, setSessionId]     = useState<string | null>(null)
  const [status, setStatus]           = useState<WebSessionStatus['status'] | null>(null)
  const [qrBase64, setQrBase64]       = useState<string | null>(null)
  const [phone, setPhone]             = useState<string | null>(null)
  const [timeLeft, setTimeLeft]       = useState(QR_TTL)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  const pollRef  = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = () => {
    if (pollRef.current)  clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const startPolling = useCallback((sid: string) => {
    stopPolling()

    pollRef.current = setInterval(async () => {
      try {
        const data = await api.whatsappWeb.getStatus(sid)
        setStatus(data.status)
        setPhone(data.phone)

        if (data.qrBase64) {
          setQrBase64(data.qrBase64)
          setTimeLeft(QR_TTL)
        }

        if (data.status === 'AUTHENTICATED') {
          stopPolling()
          setQrBase64(null)
        }
      } catch {
        // keep polling silently
      }
    }, POLL_INTERVAL)

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setQrBase64(null) // QR expired visually
          return QR_TTL
        }
        return t - 1
      })
    }, 1000)
  }, [])

  const initSession = useCallback(async (force = false) => {
    setLoading(true)
    setError('')
    setQrBase64(null)
    setStatus(null)
    try {
      const res = await api.whatsappWeb.startSession(force)
      setSessionId(res.sessionId)
      setStatus(res.status as WebSessionStatus['status'])

      if (res.status !== 'AUTHENTICATED') {
        startPolling(res.sessionId)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar sessão')
    } finally {
      setLoading(false)
    }
  }, [startPolling])

  useEffect(() => {
    initSession(forceNewSession)
    return stopPolling
  }, [initSession, forceNewSession])

  const handleDisconnect = async () => {
    if (!sessionId) return
    stopPolling()
    await api.whatsappWeb.disconnect(sessionId).catch(console.error)
    router.push('/dashboard/integrations')
  }

  const handleRefreshQr = async () => {
    if (!sessionId) return
    stopPolling()
    await api.whatsappWeb.disconnect(sessionId).catch(console.error)
    // Sempre força criação após refresh manual — a sessão acabou de ser apagada
    await initSession(true)
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/integrations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conectar via QR Code</h1>
          <p className="text-sm text-gray-500">Escaneie com seu WhatsApp para conectar</p>
        </div>
      </div>

      {/* Warning — número dedicado */}
      <Card className="mb-4 border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Use um número dedicado à plataforma</p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>O número conectado <strong>não pode ser seu WhatsApp pessoal principal</strong></li>
                <li>Não abra o <strong>WhatsApp Web</strong> com este número em outros dispositivos — isso derruba a sessão</li>
                <li>Mantenha o celular com bateria e internet para evitar expiração da sessão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mb-5 border-blue-100 bg-blue-50">
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">Como conectar</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Abra o WhatsApp no seu celular</li>
            <li>Toque em <strong>Menu</strong> (⋮) ou <strong>Configurações</strong></li>
            <li>Selecione <strong>Dispositivos conectados</strong></li>
            <li>Toque em <strong>Conectar um dispositivo</strong></li>
            <li>Aponte a câmera para o QR code abaixo</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">QR Code</p>
            {status === 'WAITING_SCAN' && qrBase64 && (
              <span className="text-xs text-gray-400">Expira em {timeLeft}s</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Gerando QR code...</p>
            </div>
          )}

          {!loading && status === 'AUTHENTICATED' && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">WhatsApp conectado!</p>
                {phone && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <Smartphone className="w-4 h-4" />
                    +{phone}
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <Button onClick={() => router.push('/dashboard/integrations')}>
                  Ir para integrações
                </Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDisconnect}>
                  <WifiOff className="w-4 h-4 mr-1" />
                  Desconectar
                </Button>
              </div>
            </div>
          )}

          {!loading && status === 'WAITING_SCAN' && qrBase64 && (
            <div className="flex flex-col items-center py-4 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrBase64}
                alt="WhatsApp QR Code"
                className="w-64 h-64 rounded-xl border border-gray-100 shadow-sm"
              />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Aguardando leitura do QR code...
              </p>
              <Button variant="ghost" size="sm" onClick={handleRefreshQr}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Gerar novo QR
              </Button>
            </div>
          )}

          {!loading && status === 'WAITING_SCAN' && !qrBase64 && (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Aguardando QR code...</p>
            </div>
          )}

          {!loading && status === 'DISCONNECTED' && (
            <div className="flex flex-col items-center py-10 gap-4">
              <WifiOff className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-500">Sessão desconectada</p>
              <Button onClick={() => initSession(true)}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Reconectar
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mt-4">
              <p className="font-medium mb-1">Não foi possível gerar o QR Code</p>
              <p className="text-red-600">{error}</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => initSession(forceNewSession)}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConnectWhatsappWebPage() {
  return (
    <Suspense>
      <ConnectWhatsappWebContent />
    </Suspense>
  )
}
