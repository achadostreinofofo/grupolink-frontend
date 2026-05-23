'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { saveAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(digits[10])
}

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : d
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

const schema = z.object({
  name:     z.string().min(2, 'Nome muito curto'),
  email:    z.string().email('E-mail inválido'),
  cpf:      z.string().min(14, 'CPF inválido').refine(validateCpf, 'CPF inválido'),
  phone:    z.string().min(14, 'Telefone inválido').optional().or(z.literal('')),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

type ConflictType = 'email' | 'cpf' | null

const CONFLICT_CONFIG = {
  email: {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    iconBg: 'bg-blue-100',
    title: 'E-mail já cadastrado',
    description: 'Já existe uma conta vinculada a este e-mail. O que deseja fazer?',
    tryAgainLabel: 'Usar um e-mail diferente',
    field: 'email' as const,
  },
  cpf: {
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
    iconBg: 'bg-amber-100',
    title: 'CPF já cadastrado',
    description: 'Já existe uma conta vinculada a este CPF. O que deseja fazer?',
    tryAgainLabel: 'Usar um CPF diferente',
    field: 'cpf' as const,
  },
}

function ConflictModal({
  type,
  onLogin,
  onTryAgain,
}: {
  type: ConflictType
  onLogin: () => void
  onTryAgain: () => void
}) {
  if (!type) return null
  const config = CONFLICT_CONFIG[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onTryAgain} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.iconBg} mx-auto`}>
          {config.icon}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={onLogin}>
            Entrar com minha conta
          </Button>
          <Button variant="secondary" className="w-full" onClick={onTryAgain}>
            {config.tryAgainLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [error, setError]       = useState('')
  const [conflict, setConflict] = useState<ConflictType>(null)
  const [emailSent, setEmailSent] = useState('')

  const { register, handleSubmit, setValue, watch, resetField, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.auth.signup({ ...data, phone: data.phone || undefined })
      setEmailSent(res.email)
    } catch (e) {
      const err = e as Error & { code?: string }
      if (err.code === 'EMAIL_ALREADY_EXISTS') {
        setConflict('email')
      } else if (err.code === 'CPF_ALREADY_EXISTS') {
        setConflict('cpf')
      } else {
        setError(err.message || 'Erro ao criar conta')
      }
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h2>
          <p className="text-sm text-gray-500 mb-1">Enviamos um link de ativação para</p>
          <p className="text-sm font-semibold text-gray-800 mb-4">{emailSent}</p>
          <p className="text-xs text-gray-400 mb-6">
            Clique no botão do e-mail para ativar sua conta.<br/>O link expira em 24 horas.
          </p>
          <button onClick={() => router.push('/login')} className="text-sm text-teal-600 hover:underline font-medium">
            Já ativei minha conta → Entrar
          </button>
        </CardContent>
      </Card>
    )
  }

  const handleCloseConflict = () => {
    if (!conflict) return
    const field = CONFLICT_CONFIG[conflict].field
    setConflict(null)
    resetField(field)
    setTimeout(() => document.getElementById(field)?.focus(), 100)
  }

  return (
    <>
      <ConflictModal
        type={conflict}
        onLogin={() => router.push('/login')}
        onTryAgain={handleCloseConflict}
      />

      <Card>
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar sua conta</h1>
          <p className="text-sm text-gray-500 mb-6">Comece grátis. Sem cartão de crédito.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Nome completo"
              placeholder="João Silva"
              error={errors.name?.message}
              {...register('name')}
            />
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
            <Input
              id="phone"
              label={<>Telefone <span className="text-gray-400 font-normal">(opcional)</span></>}
              placeholder="(00) 00000-0000"
              maxLength={15}
              error={errors.phone?.message}
              {...register('phone')}
              onChange={e => {
                const masked = maskPhone(e.target.value)
                setValue('phone', masked, { shouldValidate: !!watch('phone') })
                e.target.value = masked
              }}
            />
            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Criar conta grátis
            </Button>
          </form>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou</span></div>
          </div>

          <a href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`}>
            <Button variant="secondary" className="w-full mt-4 gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Cadastrar com Google
            </Button>
          </a>

          <p className="mt-4 text-center text-xs text-gray-400">
            Ao criar uma conta você concorda com nossos termos de uso.
          </p>

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  )
}
