'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { MessageForm, type MessageFormValues } from '@/components/messages/MessageForm'
import { SaveMessageModal, type SaveAction } from '@/components/messages/SaveMessageModal'
import { SelectGroupsModal } from '@/components/messages/SelectGroupsModal'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewMessagePage() {
  const { id: structureId } = useParams<{ id: string }>()
  const router = useRouter()

  const [showSaveModal, setShowSaveModal]   = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState('')

  const [pendingValues, setPendingValues]         = useState<MessageFormValues | null>(null)
  const [pendingAction, setPendingAction]         = useState<SaveAction | null>(null)
  const [pendingScheduledAt, setPendingScheduledAt] = useState<string | undefined>()

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

  // Step 3: group selector confirmed → execute the full save flow
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
      // Upload image to S3 only now
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
        await api.messages.sendNow(message.id, groupIds.length ? groupIds : undefined)
      }

      router.push(`/dashboard/structures/${structureId}?tab=messages`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar mensagem')
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
          <h1 className="text-2xl font-bold text-night-50">Nova Mensagem</h1>
          <p className="text-sm text-night-300">Crie uma mensagem para esta estrutura</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-night-200">Conteúdo da Mensagem</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <MessageForm submitLabel="Salvar mensagem" onSubmit={handleFormSubmit} submitting={saving} />
        </CardContent>
      </Card>

      <SaveMessageModal
        open={showSaveModal}
        saving={false}
        structureId={structureId}
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
