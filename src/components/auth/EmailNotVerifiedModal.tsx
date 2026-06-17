'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { MailCheck, X } from 'lucide-react'

interface Props {
  open: boolean
  email: string
  onClose: () => void
}

export function EmailNotVerifiedModal({ open, email, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (!open) return null

  const handleResend = async () => {
    setStatus('sending')
    setMessage('')
    try {
      await api.auth.resendVerification(email)
      setStatus('sent')
      setMessage('E-mail de confirmação reenviado! Verifique sua caixa de entrada (e o spam).')
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Não foi possível reenviar agora. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          aria-label="Fechar janela"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Confirme seu e-mail</h2>
          <p className="text-sm text-gray-500">
            Enviamos um link de confirmação para{' '}
            <span className="font-medium text-gray-700">{email}</span>. Confirme seu e-mail para
            poder acessar sua conta.
          </p>

          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <Button
            className="w-full mt-1"
            loading={status === 'sending'}
            disabled={status === 'sent'}
            onClick={handleResend}
          >
            {status === 'sent' ? 'E-mail reenviado' : 'Reenviar e-mail de confirmação'}
          </Button>

          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
