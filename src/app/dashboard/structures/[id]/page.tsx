'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { ScheduledMessage, Structure } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowLeft, CalendarClock, Copy, Download, Edit2,
  ExternalLink, Image as ImageIcon, Loader2, MessageSquare,
  Paperclip, Plus, Send, Trash2, X, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { SelectGroupsModal } from '@/components/messages/SelectGroupsModal'
import { CreateGroupParticipantsModal } from '@/components/groups/CreateGroupParticipantsModal'
import { DeleteStructureModal } from '@/components/structures/DeleteStructureModal'

const addGroupSchema = z.object({
  name:           z.string().min(2, 'Nome obrigatório'),
  startingNumber: z.coerce.number().min(1, 'Número deve ser ≥ 1').default(1),
})
type AddGroupForm = z.infer<typeof addGroupSchema>

// ─── helpers ────────────────────────────────────────────────────

function GroupStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
    ACTIVE:   { label: 'Ativo',    variant: 'green' },
    FULL:     { label: 'Cheio',   variant: 'red' },
    INACTIVE: { label: 'Inativo', variant: 'gray' },
    CREATING: { label: 'Criando…',variant: 'yellow' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

function MessageStatusBadge({ status }: { status: ScheduledMessage['status'] }) {
  const map: Record<ScheduledMessage['status'], { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
    DRAFT:     { label: 'Rascunho',  variant: 'gray' },
    PENDING:   { label: 'Agendado',  variant: 'yellow' },
    SENT:      { label: 'Enviado',   variant: 'green' },
    FAILED:    { label: 'Falhou',    variant: 'red' },
    CANCELLED: { label: 'Cancelado', variant: 'gray' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

function CapacityBar({ percentage }: { percentage: number }) {
  const pct   = Math.min(percentage * 100, 100)
  const color = pct >= 90 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-brand-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── page ───────────────────────────────────────────────────────

type Tab = 'groups' | 'messages'

export default function StructureDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router      = useRouter()

  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'groups'

  const [structure, setStructure] = useState<Structure | null>(null)
  const [messages,  setMessages]  = useState<ScheduledMessage[]>([])
  const [tab,       setTab]       = useState<Tab>(initialTab)
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [formError, setFormError] = useState('')
  const [copied,    setCopied]    = useState(false)
  const [sendingId, setSendingId]           = useState<string | null>(null)
  const [showGroupModal, setShowGroupModal]       = useState(false)
  const [pendingMsgId,  setPendingMsgId]         = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal]     = useState(false)

  // Profile picture state for group creation
  const [picFile, setPicFile]         = useState<File | null>(null)
  const [picPreview, setPicPreview]   = useState<string | null>(null)
  const [picUploading, setPicUploading] = useState(false)
  const [picError, setPicError]       = useState('')
  const picRef = useRef<HTMLInputElement>(null)

  // Participants modal state
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [pendingGroupData, setPendingGroupData]           = useState<{ name: string; startingNumber: number; profilePicUrl?: string } | null>(null)
  const [creatingGroup, setCreatingGroup]                 = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AddGroupForm>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: { startingNumber: 1 },
  })

  const watchedName   = watch('name') ?? ''
  const watchedNumber = watch('startingNumber') ?? 1

  const load = () => {
    setLoading(true)
    Promise.all([
      api.structures.get(id),
      api.messages.listByStructure(id),
    ])
      .then(([s, msgs]) => { setStructure(s); setMessages(msgs) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  // Sync tab from URL
  useEffect(() => {
    const t = searchParams.get('tab') as Tab | null
    if (t === 'messages' || t === 'groups') setTab(t)
  }, [searchParams])

  const switchTab = (t: Tab) => {
    setTab(t)
    router.replace(`/dashboard/structures/${id}?tab=${t}`, { scroll: false })
  }

  const copyLink = async () => {
    if (!structure) return
    await navigator.clipboard.writeText(structure.smartLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCsv = async (type: 'members' | 'redirects') => {
    const res = await api.export[type](id)
    if (!res.ok) return
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `${type}_${id.slice(0, 8)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const handlePicFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicError('')
    if (file.size > 5 * 1024 * 1024) { setPicError('Máximo 5 MB'); return }
    if (!file.type.startsWith('image/')) { setPicError('Somente imagens'); return }
    if (picPreview) URL.revokeObjectURL(picPreview)
    setPicFile(file)
    setPicPreview(URL.createObjectURL(file))
    if (picRef.current) picRef.current.value = ''
  }

  const removePic = () => {
    if (picPreview) URL.revokeObjectURL(picPreview)
    setPicFile(null); setPicPreview(null); setPicError('')
  }

  const isFirstGroup = !structure?.groupNamePrefix

  const onAddGroup = async (data: AddGroupForm) => {
    setFormError('')
    if (isFirstGroup && !picFile) { setPicError('Foto de perfil obrigatória para o primeiro grupo'); return }
    try {
      let profilePicUrl: string | undefined
      if (picFile) {
        setPicUploading(true)
        const { url } = await api.upload.image(picFile)
        profilePicUrl = url
        setPicUploading(false)
      }
      // Guarda os dados e abre modal de participantes
      setPendingGroupData({ name: data.name, startingNumber: data.startingNumber, profilePicUrl })
      setShowParticipantsModal(true)
    } catch (e) {
      setPicUploading(false)
      setFormError(e instanceof Error ? e.message : 'Erro ao enviar foto')
    }
  }

  const handleParticipantsConfirm = async (participantJids: string[]) => {
    if (!pendingGroupData) return
    setCreatingGroup(true)
    try {
      await api.structures.addGroup(id, {
        name:             pendingGroupData.name,
        startingNumber:   pendingGroupData.startingNumber,
        profilePicUrl:    pendingGroupData.profilePicUrl,
        participantJids,
      })
      setShowParticipantsModal(false)
      reset()
      setPicFile(null); setPicPreview(null)
      setPendingGroupData(null)
      setShowForm(false)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao criar grupo')
      setShowParticipantsModal(false)
    } finally {
      setCreatingGroup(false)
    }
  }

  const onDeleteMessage = async (msgId: string) => {
    if (!confirm('Excluir esta mensagem?')) return
    await api.messages.delete(msgId).catch(console.error)
    setMessages(prev => prev.filter(m => m.id !== msgId))
  }

  const onSendNow = (msgId: string) => {
    setPendingMsgId(msgId)
    setShowGroupModal(true)
  }

  const handleGroupConfirm = async (groupIds: string[]) => {
    setShowGroupModal(false)
    if (!pendingMsgId) return
    setSendingId(pendingMsgId)
    try {
      const updated = await api.messages.sendNow(pendingMsgId, groupIds.length ? groupIds : undefined)
      setMessages(prev => prev.map(m => m.id === pendingMsgId ? updated : m))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao enviar mensagem')
    } finally {
      setSendingId(null)
      setPendingMsgId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }
  if (!structure) return <p className="text-gray-500">Estrutura não encontrada.</p>

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/structures">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{structure.name}</h1>
          {structure.description && (
            <p className="text-sm text-gray-500 mt-0.5">{structure.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => downloadCsv('members')}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => downloadCsv('redirects')}>
            <Download className="w-3.5 h-3.5" /> Cliques
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Smart Link */}
      <Card className="mb-5">
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Smart Link</p>
            <p className="text-sm font-mono text-gray-800 truncate">{structure.smartLink}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={copyLink}>
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            <a href={structure.smartLink} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => switchTab('groups')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'groups' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Grupos ({structure.groups.length})
        </button>
        <button
          onClick={() => switchTab('messages')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'messages' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mensagens ({messages.length})
        </button>
      </div>

      {/* ── TAB: GRUPOS ── */}
      {tab === 'groups' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Grupos</h2>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4" /> Adicionar grupo
            </Button>
          </div>

          {showForm && (
            <Card className="mb-4 border-brand-200">
              <CardHeader>
                <p className="text-sm font-medium text-gray-700">
                  {isFirstGroup ? 'Primeiro Grupo da Estrutura' : 'Adicionar Grupo'}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onAddGroup)} className="space-y-4">

                  {/* Nome base + número inicial */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        label={isFirstGroup ? 'Nome base dos grupos' : 'Nome base'}
                        placeholder="Grupo Promos"
                        error={errors.name?.message}
                        {...register('name')}
                        disabled={!isFirstGroup}
                        defaultValue={structure?.groupNamePrefix ?? ''}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        label="Número inicial"
                        min={1}
                        error={errors.startingNumber?.message}
                        {...register('startingNumber')}
                        disabled={!isFirstGroup}
                        defaultValue={isFirstGroup ? 1 : structure?.nextGroupNumber}
                      />
                    </div>
                  </div>

                  {/* Preview do nome gerado */}
                  {(watchedName || structure?.groupNamePrefix) && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                      <span className="text-gray-400 text-xs">Nome do grupo: </span>
                      <span className="font-semibold text-gray-900">
                        {isFirstGroup
                          ? `${watchedName || '…'} #${watchedNumber}`
                          : `${structure?.groupNamePrefix} #${structure?.nextGroupNumber}`
                        }
                      </span>
                    </div>
                  )}

                  {/* Foto de perfil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto de perfil {isFirstGroup && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      {isFirstGroup
                        ? 'Usada neste e em todos os grupos criados automaticamente. Máx. 5 MB.'
                        : 'Deixe em branco para usar a mesma foto da estrutura.'}
                    </p>

                    <input ref={picRef} type="file" accept="image/*" className="hidden" onChange={handlePicFile} />

                    <div className="flex items-center gap-3">
                      {picPreview ? (
                        <div className="relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={picPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-brand-200" />
                          <button type="button" onClick={removePic}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : structure?.groupProfilePicUrl && !isFirstGroup ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={structure.groupProfilePicUrl} alt="Foto atual" className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 opacity-60" title="Foto atual da estrutura" />
                      ) : null}

                      <button type="button" onClick={() => picRef.current?.click()}
                        disabled={picUploading}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50">
                        {picUploading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                          : <><Paperclip className="w-4 h-4" /> {picPreview ? 'Trocar foto' : 'Selecionar foto'}</>
                        }
                      </button>
                    </div>
                    {picError && <p className="text-xs text-red-500 mt-1">{picError}</p>}
                  </div>

                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" loading={isSubmitting || picUploading}>
                      {isFirstGroup ? 'Criar primeiro grupo' : 'Adicionar grupo'}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); removePic() }}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {structure.groups.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm text-gray-400">Nenhum grupo adicionado ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {structure.groups.map((group, i) => (
                <Card key={group.id}>
                  <CardContent className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                        <GroupStatusBadge status={group.status} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {group.memberCount}/{group.maxMembers} membros ({Math.round(group.capacityPercentage * 100)}%)
                      </span>
                      <CapacityBar percentage={group.capacityPercentage} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-700">{group.clickCount.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-gray-400">cliques</p>
                    </div>
                    {group.inviteLink && (
                      <a href={group.inviteLink} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: MENSAGENS ── */}
      {tab === 'messages' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Mensagens</h2>
            <Link href={`/dashboard/structures/${id}/messages/new`}>
              <Button size="sm">
                <Plus className="w-4 h-4" /> Nova mensagem
              </Button>
            </Link>
          </div>

          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">Nenhuma mensagem criada ainda</p>
                <Link href={`/dashboard/structures/${id}/messages/new`}>
                  <Button size="sm" variant="secondary" className="mt-2">
                    <Plus className="w-4 h-4" /> Criar mensagem
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <Card key={msg.id}>
                  <CardContent className="flex items-start gap-4">
                    {/* icon */}
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {msg.mediaUrl
                        ? <ImageIcon className="w-4 h-4 text-gray-400" />
                        : <MessageSquare className="w-4 h-4 text-gray-400" />
                      }
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm truncate">{msg.title}</p>
                        <MessageStatusBadge status={msg.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.content}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        {msg.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {fmt(msg.scheduledAt)}
                          </span>
                        )}
                        {msg.executedAt && <span>Enviado: {fmt(msg.executedAt)}</span>}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:bg-teal-50"
                        loading={sendingId === msg.id}
                        onClick={() => onSendNow(msg.id)}
                        title="Enviar agora"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                      <Link href={`/dashboard/structures/${id}/messages/${msg.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDeleteMessage(msg.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <DeleteStructureModal
        open={showDeleteModal}
        structureName={structure?.name ?? ''}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await api.structures.delete(id)
          router.push('/dashboard/structures')
        }}
      />

      <CreateGroupParticipantsModal
        open={showParticipantsModal}
        groupName={
          pendingGroupData
            ? `${pendingGroupData.name} #${pendingGroupData.startingNumber}`
            : ''
        }
        onClose={() => { setShowParticipantsModal(false); setPendingGroupData(null) }}
        onConfirm={handleParticipantsConfirm}
        loading={creatingGroup}
      />

      <SelectGroupsModal
        open={showGroupModal}
        structureId={id}
        onClose={() => { setShowGroupModal(false); setPendingMsgId(null) }}
        onConfirm={handleGroupConfirm}
      />
    </div>
  )
}
