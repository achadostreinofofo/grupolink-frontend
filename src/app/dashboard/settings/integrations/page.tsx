'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { MlStatus } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loader, Check, AlertCircle, Settings, X, ExternalLink, LinkIcon } from 'lucide-react'

// Extracts matt_word and matt_tool from any ML affiliate URL
function extractAffiliateParams(link: string): { mattWord: string; mattTool: string } | null {
  try {
    const url = new URL(link.trim())
    const mattWord = url.searchParams.get('matt_word')
    const mattTool = url.searchParams.get('matt_tool')
    if (mattWord && mattTool) return { mattWord, mattTool }
    return null
  } catch {
    return null
  }
}

function AffiliateParamsModal({
  onSave,
  onSkip,
}: {
  onSave: (mattWord: string, mattTool: string) => Promise<void>
  onSkip: () => void
}) {
  const [link, setLink] = useState('')
  const [parsed, setParsed] = useState<{ mattWord: string; mattTool: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  const handleLinkChange = async (value: string) => {
    setLink(value)
    setError('')

    const direct = extractAffiliateParams(value)
    if (direct) {
      setParsed(direct)
      return
    }

    setParsed(null)

    // For short links (meli.la) or full URLs without visible params, ask the backend to
    // follow redirect hops server-side until it finds matt_word / matt_tool
    const trimmed = value.trim()
    if (!trimmed || !trimmed.startsWith('http')) return

    setResolving(true)
    try {
      const result = await api.mercadolivre.resolveAffiliateParams(trimmed)
      setParsed(result)
    } catch {
      setError('Parâmetros de afiliado não encontrados neste link. Tente um link gerado em afiliados.mercadolivre.com.br.')
    } finally {
      setResolving(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) {
      setError('Não foi possível extrair os parâmetros. Verifique se o link contém ?matt_word=... e &matt_tool=...')
      return
    }
    setSaving(true)
    try {
      await onSave(parsed.mattWord, parsed.mattTool)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-night-700 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-night-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-night-50">Configurar links de afiliado</p>
              <p className="text-xs text-night-300">Passo 2 de 2</p>
            </div>
          </div>
          <button onClick={onSkip} className="text-night-400 hover:text-night-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-night-200">
            Para ativar a substituição automática, cole qualquer link de afiliado gerado pelo seu painel Mercado Livre.
            Links curtos <span className="font-mono text-xs">meli.la/...</span> também são aceitos.
          </p>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-1">
            <p className="text-xs font-medium text-blue-800">Como obter seu link:</p>
            <ol className="text-xs text-blue-700 list-decimal list-inside space-y-0.5">
              <li>Acesse <a href="https://afiliados.mercadolivre.com.br" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">afiliados.mercadolivre.com.br <ExternalLink className="w-3 h-3" /></a></li>
              <li>Vá em <strong>Criar link</strong> e gere o link de qualquer produto</li>
              <li>Cole o link gerado aqui</li>
            </ol>
          </div>

          <div>
            <label className="block text-xs font-medium text-night-200 mb-1">
              Link de afiliado
            </label>
            <div className="relative">
              <input
                type="text"
                value={link}
                onChange={e => handleLinkChange(e.target.value)}
                placeholder="https://meli.la/... ou https://www.mercadolivre.com.br/produto?matt_word=..."
                className="w-full text-sm border border-night-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-8"
                disabled={resolving || saving}
              />
              {resolving && (
                <Loader className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-night-400 animate-spin" />
              )}
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {resolving && <p className="text-xs text-night-300 mt-1">Resolvendo link...</p>}
          </div>

          {parsed && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
              <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Parâmetros identificados
              </p>
              <p className="text-xs text-green-700 font-mono">matt_word: <strong>{parsed.mattWord}</strong></p>
              <p className="text-xs text-green-700 font-mono">matt_tool: <strong>{parsed.mattTool}</strong></p>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 pt-0">
          <Button
            onClick={handleSave}
            disabled={!parsed || saving || resolving}
            loading={saving}
            className="flex-1"
          >
            Salvar e ativar
          </Button>
          <Button variant="ghost" onClick={onSkip} disabled={saving || resolving}>
            Configurar depois
          </Button>
        </div>
      </div>
    </div>
  )
}

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const [mlStatus, setMlStatus] = useState<MlStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showAffiliateModal, setShowAffiliateModal] = useState(false)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchMlStatus = async () => {
    try {
      const status = await api.mercadolivre.getStatus()
      setMlStatus(status)
      return status
    } catch {
      setMlStatus({ connected: false, nickname: null })
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMlStatus()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const mlParam = searchParams.get('ml')
    if (mlParam === 'success') {
      showToast('success', 'Conta Mercado Livre conectada com sucesso!')
      fetchMlStatus().then(status => {
        if (status?.connected && !status.affiliateConfigured) {
          setShowAffiliateModal(true)
        }
      })
    } else if (mlParam === 'error') {
      const errorDesc = searchParams.get('error_desc') || 'Erro desconhecido'
      showToast('error', `Erro ao conectar: ${errorDesc}`)
    }
  }, [searchParams])

  const handleConnect = async () => {
    try {
      const { authorizationUrl } = await api.mercadolivre.startOAuth()
      window.location.href = authorizationUrl
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao iniciar conexão')
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Tem certeza? Isso desabilitará o monitoramento e redistribuição de links de afiliado.')) return
    setDisconnecting(true)
    try {
      await api.mercadolivre.disconnect()
      setMlStatus({ connected: false, nickname: null })
      showToast('success', 'Conta Mercado Livre desconectada')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao desconectar')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleSaveAffiliateParams = async (mattWord: string, mattTool: string) => {
    await api.mercadolivre.saveAffiliateParams(mattWord, mattTool)
    setShowAffiliateModal(false)
    showToast('success', 'Parâmetros de afiliado salvos! Links serão substituídos automaticamente.')
    fetchMlStatus()
  }

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="h-40 bg-night-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      {showAffiliateModal && (
        <AffiliateParamsModal
          onSave={handleSaveAffiliateParams}
          onSkip={() => setShowAffiliateModal(false)}
        />
      )}

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-night-50">Integrações</h1>
        <p className="text-sm text-night-300 mt-1">Conecte serviços externos para potencializar sua plataforma</p>
      </div>

      {toast && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success'
            ? <Check className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
          }
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <span className="text-xl font-bold text-yellow-600">M</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-night-50">Mercado Livre Afiliados</p>
                <p className="text-xs text-night-300">Substitua links por seus links de afiliado automaticamente</p>
              </div>
            </div>
            {mlStatus?.connected && (
              <Badge variant={mlStatus.affiliateConfigured ? 'green' : 'yellow'}>
                {mlStatus.affiliateConfigured ? 'Ativo' : 'Conectado'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mlStatus?.connected ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Conta:</span> {mlStatus.nickname}
                </p>
              </div>

              {mlStatus.affiliateConfigured ? (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Links de afiliado ativos</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      Links meli.la detectados nos grupos monitorados serão substituídos automaticamente pelos seus links de afiliado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Links de afiliado não configurados</p>
                    <p className="text-xs text-amber-700 mt-0.5 mb-2">
                      Configure seus parâmetros para ativar a substituição automática de links.
                    </p>
                    <Button size="sm" onClick={() => setShowAffiliateModal(true)}>
                      <Settings className="w-3.5 h-3.5 mr-1" />
                      Configurar agora
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {mlStatus.affiliateConfigured && (
                  <Button variant="secondary" size="sm" onClick={() => setShowAffiliateModal(true)}>
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Reconfigurar afiliado
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisconnect}
                  loading={disconnecting}
                >
                  Desconectar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-night-200">
                Conecte sua conta Mercado Livre para que links detectados nos grupos monitorados sejam automaticamente substituídos pelos seus links de afiliado.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Requisito:</span> Você precisa estar registrado no{' '}
                  <a href="https://afiliados.mercadolivre.com.br" target="_blank" rel="noreferrer" className="underline">
                    Programa de Afiliados do Mercado Livre
                  </a>.
                </p>
              </div>
              <Button onClick={handleConnect} variant="primary" size="sm">
                Conectar Mercado Livre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-900">
          <span className="font-medium">Como funciona:</span> Quando um link meli.la for detectado em um grupo monitorado, o sistema resolve o produto e gera um link de afiliado limpo com seus parâmetros antes de redistribuir para sua estrutura.
        </p>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="max-w-xl"><div className="h-40 bg-night-700 rounded-xl animate-pulse" /></div>}>
      <IntegrationsContent />
    </Suspense>
  )
}
