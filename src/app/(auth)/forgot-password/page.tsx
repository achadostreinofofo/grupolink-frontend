'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  cpf:   z.string().min(14, 'CPF inválido'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await api.auth.forgotPassword(data).catch(() => {})
    setSent(true)
  }

  if (sent) return (
    <Card><CardContent className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail enviado</h2>
      <p className="text-sm text-gray-500 mb-6">
        Se os dados conferem, você receberá um e-mail com instruções para redefinir sua senha.<br/>
        O link expira em 2 horas.
      </p>
      <Link href="/login"><Button variant="secondary">Voltar para o login</Button></Link>
    </CardContent></Card>
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Recuperar senha</h1>
        <p className="text-sm text-gray-500 mb-6">
          Informe seu e-mail e CPF cadastrados para receber o link de redefinição.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            maxLength={14}
            error={errors.cpf?.message}
            {...register('cpf')}
            onChange={e => {
              const masked = maskCpf(e.target.value)
              setValue('cpf', masked, { shouldValidate: !!watch('cpf') })
              e.target.value = masked
            }}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Enviar link de recuperação
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">Entrar</Link>
        </p>
      </CardContent>
    </Card>
  )
}
