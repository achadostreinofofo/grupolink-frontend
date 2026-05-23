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
      const err = e as Error & { code?: string }
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setError('EMAIL_NOT_VERIFIED')
      } else {
        setError(err.message || 'Erro ao fazer login')
      }
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

          {error === 'EMAIL_NOT_VERIFIED' ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
              <p className="font-medium mb-1">E-mail não verificado</p>
              <p>Verifique sua caixa de entrada e clique no link de ativação que enviamos.</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Entrar
          </Button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </form>

        <div className="mt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">ou</span>
          </div>
        </div>

        <a href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`}>
          <Button variant="secondary" className="w-full mt-4 gap-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </Button>
        </a>

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
