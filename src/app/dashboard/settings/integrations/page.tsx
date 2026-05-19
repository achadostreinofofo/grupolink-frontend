'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { MlStatus } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loader, Check, AlertCircle } from 'lucide-react'

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const [mlStatus, setMlStatus] = useState<MlStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Check for OAuth callback success/error
  useEffect(() => {
    const mlParam = searchParams.get('ml')
    if (mlParam === 'success') {
      setToast({ type: 'success', message: 'Conta Mercado Livre conectada com sucesso!' })
      setTimeout(() => setToast(null), 4000)
      // Refresh ML status
      fetchMlStatus()
    } else if (mlParam === 'error') {
      const errorDesc = searchParams.get('error_desc') || 'Erro desconhecido'
      setToast({ type: 'error', message: `Erro ao conectar: ${errorDesc}` })
      setTimeout(() => setToast(null), 4000)
    }
  }, [searchParams])

  useEffect(() => {
    fetchMlStatus()
  }, [])

  const fetchMlStatus = async () => {
    try {
      const status = await api.mercadolivre.getStatus()
      setMlStatus(status)
    } catch (err) {
      console.error('Error fetching ML status:', err)
      setMlStatus({ connected: false, nickname: null })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      const { authorizationUrl } = await api.mercadolivre.startOAuth()
      window.location.href = authorizationUrl
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao iniciar conexão'
      })
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Tem certeza? Isso desabilitará o monitoramento e redistribuição de links de afiliado.')) {
      return
    }

    setDisconnecting(true)
    try {
      await api.mercadolivre.disconnect()
      setMlStatus({ connected: false, nickname: null })
      setToast({ type: 'success', message: 'Conta Mercado Livre desconectada' })
      setTimeout(() => setToast(null), 4000)
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao desconectar'
      })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-sm text-gray-500 mt-1">Conecte serviços externos para potencializar sua plataforma</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Mercado Livre Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <span className="text-xl font-bold text-yellow-600">M</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Mercado Livre Afiliados</p>
                <p className="text-xs text-gray-500">Substitua links por seus links de afiliado automaticamente</p>
              </div>
            </div>
            {mlStatus?.connected && (
              <Badge variant="green">Conectado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mlStatus?.connected ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Conta conectada:</span> {mlStatus.nickname}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Quando o monitoramento detectar um link meli.la em um grupo, ele será automaticamente substituído por seu link de afiliado Mercado Livre antes de ser redistribuído para os grupos da sua estrutura.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDisconnect}
                loading={disconnecting}
              >
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Conecte sua conta Mercado Livre para que os links de afiliado detectados no monitoramento sejam automaticamente substituídos pelos seus links de afiliado, permitindo que você ganhe comissões ao redistribuir links.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Requisito:</span> Você precisa estar registrado no programa de Afiliados do Mercado Livre para gerar links de afiliado.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                variant="primary"
                size="sm"
              >
                Conectar Mercado Livre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-900">
          <span className="font-medium">💡 Dica:</span> O monitoramento de grupos só funciona se você tiver uma conta Mercado Livre conectada.
        </p>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="max-w-xl"><div className="h-40 bg-gray-100 rounded-xl animate-pulse" /></div>}>
      <IntegrationsContent />
    </Suspense>
  )
}
