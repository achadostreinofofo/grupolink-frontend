'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { PendingAction } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, Check, ExternalLink } from 'lucide-react'

const schema = z.object({
  inviteLink: z.string().url('URL inválida (inclua https://)'),
})

type FormData = z.infer<typeof schema>

function PendingGroupRow({ action, onActivated }: {
  action: PendingAction
  onActivated: () => void
}) {
  const [open, setOpen]     = useState(false)
  const [error, setError]   = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ inviteLink }: FormData) => {
    setError('')
    try {
      await api.dashboard.updateGroup(action.structureId, action.groupId, { inviteLink })
      onActivated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao ativar grupo')
    }
  }

  return (
    <div className="border border-yellow-100 rounded-xl p-4 bg-yellow-50/50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 text-sm">{action.groupName}</p>
            <Badge variant="yellow">Aguardando link</Badge>
            <span className="text-xs text-gray-400">{action.structureName} · #{action.sortOrder + 1}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Criado automaticamente quando a estrutura atingiu o threshold. Adicione o link de convite para ativá-lo.
          </p>

          {!open ? (
            <Button size="sm" className="mt-2" onClick={() => setOpen(true)}>
              Adicionar link de convite
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://chat.whatsapp.com/..."
                  error={errors.inviteLink?.message}
                  {...register('inviteLink')}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </div>
              <Button type="submit" size="sm" loading={isSubmitting}>
                <Check className="w-3.5 h-3.5" /> Ativar
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export function PendingActionsCard({ actions, onActionCompleted }: {
  actions: PendingAction[]
  onActionCompleted: () => void
}) {
  if (actions.length === 0) return null

  return (
    <Card className="mb-6 border-yellow-200">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <p className="text-sm font-semibold text-gray-800">
            Ações Pendentes
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {actions.length}
            </span>
          </p>
        </div>
        <a
          href="https://business.whatsapp.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          Abrir WhatsApp Business <ExternalLink className="w-3 h-3" />
        </a>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {actions.map(action => (
          <PendingGroupRow
            key={action.groupId}
            action={action}
            onActivated={onActionCompleted}
          />
        ))}
      </CardContent>
    </Card>
  )
}
