'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { saveAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.auth.login(data)
      saveAuth(res.token)
      const redirect = params.get('redirect') ?? '/dashboard'
      router.push(redirect)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao fazer login')
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h1>
        <p className="text-sm text-gray-500 mb-6">Entre na sua conta GrupoLink</p>

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
            id="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Criar agora
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
