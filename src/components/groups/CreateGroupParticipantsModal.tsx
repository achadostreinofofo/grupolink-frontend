'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { WebSessionStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Loader2, Phone, Smartphone, Users, X, XCircle } from 'lucide-react'

interface Props {
  open: boolean
  groupName: string          // nome final ex: "Achados Treino #10"
  onClose: () => void
  onConfirm: (participantPhones: string[]) => void
  loading?: boolean
}

interface PhoneCheck {
  raw: string       // digitado pelo usuário
  formatted: string // com DDI
  exists: boolean | null  // null = não verificado
  checking: boolean
  error: string
}

export function CreateGroupParticipantsModal({ open, groupName, onClose, onConfirm, loading }: Props) {
  const [sessions, setSessions]       = useState<WebSessionStatus[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [selectedSessions, setSelected] = useState<Set<string>>(new Set())

  // Para 1 sessão: número manual
  const [phone, setPhone]   = useState('')
  const [phoneCheck, setPhoneCheck] = useState<PhoneCheck | null>(null)

  useEffect(() => {
    if (!open) return
    setPhone('')
    setPhoneCheck(null)
    setSelected(new Set())
    setLoadingSessions(true)
    api.whatsappWeb.listSessions()
      .then(s => {
        const authenticated = s.filter(x => x.status === 'AUTHENTICATED')
        setSessions(authenticated)
      })
      .catch(console.error)
      .finally(() => setLoadingSessions(false))
  }, [open])

  if (!open) return null

  const hasSingleSession  = sessions.length === 1
  const hasMultiSessions  = sessions.length >= 2
  const noSession         = sessions.length === 0

  // ── Verifica número (modo 1 sessão) ─────────────────────────────
  const handleCheckPhone = async () => {
    const raw = phone.replace(/\D/g, '')
    if (raw.length < 10) return
    setPhoneCheck({ raw, formatted: '', exists: null, checking: true, error: '' })
    try {
      const res = await api.whatsappWeb.checkNumber(raw)
      setPhoneCheck({ raw, formatted: res.formattedPhone, exists: res.exists, checking: false, error: '' })
    } catch (e) {
      setPhoneCheck({ raw, formatted: '', exists: null, checking: false, error: e instanceof Error ? e.message : 'Erro' })
    }
  }

  const toggleSession = (sessionId: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId)
      return next
    })

  // ── Monta lista de participantes e confirma ─────────────────────
  const handleConfirm = () => {
    const phones: string[] = []

    if (hasSingleSession && phoneCheck?.exists && phoneCheck.formatted) {
      phones.push(phoneCheck.formatted)
    }

    if (hasMultiSessions) {
      sessions
        .filter(s => selectedSessions.has(s.sessionId) && s.phone)
        .forEach(s => phones.push(`55${s.phone}`))
    }

    onConfirm(phones)
  }

  const canConfirm =
    (hasSingleSession && phoneCheck?.exists === true) ||
    (hasMultiSessions && selectedSessions.size >= 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Participantes iniciais</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Criar grupo <span className="font-medium text-gray-600">{groupName}</span> no WhatsApp
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : noSession ? (
            /* ── Sem sessão conectada ── */
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <p className="font-medium mb-1">Nenhuma conta WhatsApp conectada</p>
              <p className="text-xs">Conecte uma conta via QR Code em <strong>WhatsApp → Conectar via QR Code</strong> antes de criar grupos.</p>
            </div>
          ) : hasSingleSession ? (
            /* ── 1 sessão: pede número adicional ── */
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
                <p className="font-medium">Conta conectada: +{sessions[0].phone}</p>
                <p className="text-xs mt-0.5">O WhatsApp exige pelo menos 2 participantes para criar um grupo. Informe um número adicional.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  Número adicional (DDD + número)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-400">
                    <span className="pl-3 text-sm text-gray-500 select-none">+55</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneCheck(null) }}
                      onKeyDown={e => e.key === 'Enter' && handleCheckPhone()}
                      placeholder="11999998888"
                      maxLength={11}
                      className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCheckPhone}
                    disabled={phone.replace(/\D/g, '').length < 10 || phoneCheck?.checking}
                    loading={phoneCheck?.checking}
                  >
                    Verificar
                  </Button>
                </div>

                {phoneCheck && !phoneCheck.checking && (
                  <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${phoneCheck.exists ? 'text-green-600' : 'text-red-500'}`}>
                    {phoneCheck.exists
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Conta WhatsApp ativa (+55{phoneCheck.raw})</>
                      : <><XCircle className="w-3.5 h-3.5" /> {phoneCheck.error || 'Número não encontrado no WhatsApp'}</>
                    }
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── 2+ sessões: escolha quais incluir ── */
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4 inline mr-1 text-gray-400" />
                Selecione quais contas conectadas vão participar do grupo:
              </p>
              {sessions.map(s => (
                <label key={s.sessionId} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSessions.has(s.sessionId)}
                    onChange={() => toggleSession(s.sessionId)}
                    className="accent-teal-500 w-4 h-4 flex-shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">+{s.phone}</p>
                    <p className="text-xs text-gray-400">Conta conectada</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!canConfirm || loading || noSession}
            loading={loading}
            onClick={handleConfirm}
          >
            Criar grupo no WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}
