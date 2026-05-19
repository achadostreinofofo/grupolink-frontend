'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { ScheduledMessage } from '@/types'
import { MessageForm, type MessageFormValues } from '@/components/messages/MessageForm'
import { SaveMessageModal, type SaveAction } from '@/components/messages/SaveMessageModal'
import { SelectGroupsModal } from '@/components/messages/SelectGroupsModal'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditMessagePage() {
  const { id: structureId, msgId } = useParams<{ id: string; msgId: string }>()
  const router = useRouter()

  const [message, setMessage]               = useState<ScheduledMessage | null>(null)
  const [loading, setLoading]               = useState(true)
  const [showSaveModal, setShowSaveModal]   = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState('')

  const [pendingValues, setPendingValues]           = useState<MessageFormValues | null>(null)
  const [pendingAction, setPendingAction]           = useState<SaveAction | null>(null)
  const [pendingScheduledAt, setPendingScheduledAt] = useState<string | undefined>()

  useEffect(() => {
    api.messages.listByStructure(structureId)
      .then(msgs => setMessage(msgs.find(m => m.id === msgId) ?? null))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [structureId, msgId])

  // Step 1: form submitted → open SaveMessageModal
  const handleFormSubmit = (values: MessageFormValues) => {
    setPendingValues(values)
    setShowSaveModal(true)
  }

  // Step 2: SaveMessageModal confirmed → for draft save immediately, otherwise open group selector
  const handleSaveConfirm = (action: SaveAction, scheduledAt?: string) => {
    setShowSaveModal(false)
    setPendingAction(action)
    setPendingScheduledAt(scheduledAt)

    if (action === 'draft') {
      executeSave(action, scheduledAt, [])
    } else {
      setShowGroupModal(true)
    }
  }

  // Step 3: group selector confirmed → execute save
  const handleGroupConfirm = (groupIds: string[]) => {
    setShowGroupModal(false)
    if (pendingAction && pendingAction !== 'draft') {
      executeSave(pendingAction, pendingScheduledAt, groupIds)
    }
  }

  const executeSave = async (action: SaveAction, scheduledAt: string | undefined, groupIds: string[]) => {
    if (!pendingValues) return
    setSaving(true)
    setError('')
    try {
      // Upload new image to S3 only now
      let mediaUrl = pendingValues.mediaUrl
      if (pendingValues.file) {
        const { url } = await api.upload.image(pendingValues.file)
        mediaUrl = url
      }

      await api.messages.update(msgId, {
        title:       pendingValues.title,
        content:     pendingValues.content,
        mediaUrl,
        scheduledAt: action === 'schedule' ? scheduledAt : undefined,
      })

      if (action === 'send_now') {
        await api.messages.sendNow(msgId, groupIds.length ? groupIds : undefined)
      }

      router.push(`/dashboard/structures/${structureId}?tab=messages`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar mensagem')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!message) return <p className="text-gray-500 text-sm">Mensagem não encontrada.</p>

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/structures/${structureId}?tab=messages`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Mensagem</h1>
          <p className="text-sm text-gray-500 truncate max-w-xs">{message.title}</p>
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
          <MessageForm
            defaultValues={{
              title:    message.title,
              content:  message.content,
              mediaUrl: message.mediaUrl ?? undefined,
            }}
            submitLabel="Salvar alterações"
            onSubmit={handleFormSubmit}
            submitting={saving}
          />
        </CardContent>
      </Card>

      <SaveMessageModal
        open={showSaveModal}
        saving={false}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <SelectGroupsModal
        open={showGroupModal}
        structureId={structureId}
        onClose={() => setShowGroupModal(false)}
        onConfirm={handleGroupConfirm}
      />
    </div>
  )
}
