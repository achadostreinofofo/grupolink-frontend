'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { MessageForm, type MessageFormValues } from '@/components/messages/MessageForm'
import { SaveMessageModal, type SaveAction } from '@/components/messages/SaveMessageModal'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewMessagePage() {
  const { id: structureId } = useParams<{ id: string }>()
  const router = useRouter()

  const [showModal, setShowModal]       = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [pendingValues, setPendingValues] = useState<MessageFormValues | null>(null)

  const handleFormSubmit = (values: MessageFormValues) => {
    setPendingValues(values)
    setShowModal(true)
  }

  const handleConfirm = async (action: SaveAction, scheduledAt?: string) => {
    if (!pendingValues) return
    setSaving(true)
    setError('')
    try {
      // Upload image to S3 only now, after user confirmed the action
      let mediaUrl = pendingValues.mediaUrl
      if (pendingValues.file) {
        const { url } = await api.upload.image(pendingValues.file)
        mediaUrl = url
      }

      const message = await api.messages.create(structureId, {
        title:       pendingValues.title,
        content:     pendingValues.content,
        mediaUrl,
        scheduledAt: action === 'schedule' ? scheduledAt : undefined,
      })

      if (action === 'send_now') {
        await api.messages.sendNow(message.id)
      }

      setShowModal(false)
      router.push(`/dashboard/structures/${structureId}?tab=messages`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar mensagem')
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/structures/${structureId}?tab=messages`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Mensagem</h1>
          <p className="text-sm text-gray-500">Crie uma mensagem para esta estrutura</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-gray-700">Conteúdo da Mensagem</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <MessageForm submitLabel="Salvar mensagem" onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>

      <SaveMessageModal
        open={showModal}
        saving={saving}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
