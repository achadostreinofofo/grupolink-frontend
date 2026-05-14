'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  slug: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(60, 'Máximo 60 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  description: z.string().optional(),
  maxMembersPerGroup: z.coerce.number().min(1).max(1024).default(256),
  fillThreshold: z.coerce.number().min(0.1).max(1).default(0.8),
})

type FormData = z.infer<typeof schema>

export default function NewStructurePage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMembersPerGroup: 256, fillThreshold: 0.8 },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const structure = await api.structures.create(data)
      router.push(`/dashboard/structures/${structure.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar estrutura')
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/structures">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Estrutura</h1>
          <p className="text-sm text-gray-500">Configure um container para seus grupos WhatsApp</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-gray-700">Informações da Estrutura</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Nome da estrutura"
              placeholder="Ex: Ofertas Mercado Livre"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <Input
                id="slug"
                label="Slug (URL do link)"
                placeholder="ofertas-ml"
                error={errors.slug?.message}
                {...register('slug')}
              />
              <p className="text-xs text-gray-400 mt-1">
                Seu smart link será: <code className="bg-gray-100 px-1 rounded">/r/seu-slug</code>
              </p>
            </div>

            <Input
              id="description"
              label="Descrição (opcional)"
              placeholder="Grupos de ofertas do ML para afiliados"
              {...register('description')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="maxMembersPerGroup"
                type="number"
                label="Máx. membros por grupo"
                error={errors.maxMembersPerGroup?.message}
                {...register('maxMembersPerGroup')}
              />
              <div>
                <Input
                  id="fillThreshold"
                  type="number"
                  step="0.05"
                  label="Threshold de preenchimento"
                  error={errors.fillThreshold?.message}
                  {...register('fillThreshold')}
                />
                <p className="text-xs text-gray-400 mt-1">0.8 = ativa próximo ao atingir 80%</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isSubmitting} className="flex-1">
                Criar Estrutura
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="secondary">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
