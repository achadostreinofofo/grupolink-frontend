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
import { ArrowLeft, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name:              z.string().min(2, 'Nome muito curto'),
  description:       z.string().optional(),
  maxMembersPerGroup: z.coerce.number().min(1).max(1024).default(256),
  fillThresholdPct:  z.coerce.number().min(50).max(100).default(80),
})

type FormData = z.infer<typeof schema>

export default function NewStructurePage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMembersPerGroup: 256, fillThresholdPct: 80 },
  })

  const thresholdPct = watch('fillThresholdPct') ?? 80

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const structure = await api.structures.create({
        name:               data.name,
        description:        data.description,
        maxMembersPerGroup: data.maxMembersPerGroup,
        fillThreshold:      data.fillThresholdPct / 100,
      })
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <Input
              id="name"
              label="Nome da estrutura"
              placeholder="Ex: Ofertas Mercado Livre"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="description"
              label="Descrição (opcional)"
              placeholder="Breve descrição sobre o objetivo dessa estrutura"
              {...register('description')}
            />

            <div>
              <label htmlFor="maxMembersPerGroup" className="block text-sm font-medium text-gray-700 mb-1">
                Número máximo de membros por grupo
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Limite de pessoas em cada grupo do WhatsApp. Máximo permitido: 1024 pessoas.
              </p>
              <div className="flex items-center gap-3">
                <Input
                  id="maxMembersPerGroup"
                  type="number"
                  min={1}
                  max={1024}
                  error={errors.maxMembersPerGroup?.message}
                  className="w-32"
                  {...register('maxMembersPerGroup')}
                  onInput={e => {
                    const el = e.currentTarget
                    const v = parseInt(el.value)
                    if (v > 1024) el.value = '1024'
                    if (v < 1) el.value = '1'
                  }}
                />
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>pessoas por grupo</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quando direcionar para o próximo grupo?
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Quando um grupo atingir essa porcentagem da capacidade, os novos membros serão
                automaticamente direcionados para o próximo grupo disponível.
              </p>

              <div className="flex items-center gap-4">
                <input
                  id="fillThresholdPct"
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  {...register('fillThresholdPct')}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-teal-500 bg-gray-200"
                />
                <div className="text-right w-16 shrink-0">
                  <span className="text-2xl font-bold text-teal-600">{thresholdPct}%</span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              {thresholdPct === 100 && (
                <div className="flex items-start gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Com 100%, o grupo só vai para o próximo quando estiver completamente lotado.
                  </p>
                </div>
              )}
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
