'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { Structure } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Copy, Plus, ArrowLeft, ExternalLink, Download, Send } from 'lucide-react'
import Link from 'next/link'

const addGroupSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  inviteLink: z.string().url('URL inválida').optional().or(z.literal('')),
  maxMembers: z.coerce.number().min(1).max(1024).default(256),
})

type AddGroupForm = z.infer<typeof addGroupSchema>

function GroupStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
    ACTIVE:   { label: 'Ativo',     variant: 'green' },
    FULL:     { label: 'Cheio',     variant: 'red' },
    INACTIVE: { label: 'Inativo',   variant: 'gray' },
    CREATING: { label: 'Criando…',  variant: 'yellow' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

function CapacityBar({ percentage }: { percentage: number }) {
  const pct = Math.min(percentage * 100, 100)
  const color = pct >= 90 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-brand-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function StructureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [structure, setStructure] = useState<Structure | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddGroupForm>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: { maxMembers: 256 },
  })

  const load = () => {
    setLoading(true)
    api.structures.get(id)
      .then(setStructure)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

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
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${type}_${id.slice(0, 8)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onAddGroup = async (data: AddGroupForm) => {
    setFormError('')
    try {
      await api.structures.addGroup(id, {
        name: data.name,
        inviteLink: data.inviteLink || undefined,
        maxMembers: data.maxMembers,
      })
      reset()
      setShowForm(false)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao adicionar grupo')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!structure) {
    return <p className="text-gray-500">Estrutura não encontrada.</p>
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{structure.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{structure.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/structures/${id}/broadcast`}>
            <Button size="sm">
              <Send className="w-3.5 h-3.5" /> Transmitir
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => downloadCsv('members')}>
            <Download className="w-3.5 h-3.5" /> Membros CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => downloadCsv('redirects')}>
            <Download className="w-3.5 h-3.5" /> Cliques CSV
          </Button>
        </div>
      </div>

      {/* Smart Link */}
      <Card className="mb-6">
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

      {/* Grupos */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">
          Grupos <span className="text-gray-400 font-normal">({structure.groups.length})</span>
        </h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Adicionar grupo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4 border-brand-200">
          <CardHeader>
            <p className="text-sm font-medium text-gray-700">Novo Grupo</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onAddGroup)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nome do grupo"
                  placeholder="Grupo Promos #1"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  type="number"
                  label="Máx. membros"
                  error={errors.maxMembers?.message}
                  {...register('maxMembers')}
                />
              </div>
              <Input
                label="Link de convite (opcional)"
                placeholder="https://chat.whatsapp.com/..."
                error={errors.inviteLink?.message}
                {...register('inviteLink')}
              />
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={isSubmitting}>Adicionar</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
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
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {group.memberCount}/{group.maxMembers} membros
                      ({Math.round(group.capacityPercentage * 100)}%)
                    </span>
                  </div>
                  <CapacityBar percentage={group.capacityPercentage} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{group.clickCount.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">cliques</p>
                </div>
                {group.inviteLink && (
                  <a href={group.inviteLink} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
