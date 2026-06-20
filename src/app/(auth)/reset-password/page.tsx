'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

const schema = z.object({
  newPassword:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function ResetPasswordHandler() {
  const router  = useRouter()
  const params  = useSearchParams()
  const token   = params.get('token') ?? ''
  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Valida o token ao abrir a página: avisa cedo se o link expirou, em vez de
  // só ao salvar a nova senha.
  useEffect(() => {
    if (!token) { setTokenState('invalid'); return }
    api.auth.validateResetToken(token)
      .then(res => setTokenState(res.valid ? 'valid' : 'invalid'))
      .catch(() => setTokenState('invalid'))
  }, [token])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.auth.resetPassword({ token, newPassword: data.newPassword })
      setDone(true)
      setTimeout(() => router.replace('/login'), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao redefinir senha')
    }
  }

  if (tokenState === 'checking') return (
    <Card><CardContent className="py-14 text-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-gray-500">Validando seu link...</p>
    </CardContent></Card>
  )

  if (tokenState === 'invalid') return (
    <Card><CardContent className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 12.99A1.5 1.5 0 004.14 19.5h15.72a1.5 1.5 0 001.3-2.57l-7.5-12.99a1.5 1.5 0 00-2.6 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h2>
      <p className="text-sm text-gray-500 mb-6">
        Este link de redefinição não é mais válido (eles expiram em 2 horas). Solicite um novo para continuar.
      </p>
      <Link href="/forgot-password"><Button>Solicitar novo link</Button></Link>
    </CardContent></Card>
  )

  if (done) return (
    <Card><CardContent className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
      <p className="text-sm text-gray-500 mb-6">Sua senha foi alterada. Redirecionando para o login...</p>
      <Link href="/login"><Button>Entrar agora</Button></Link>
    </CardContent></Card>
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova senha</h1>
        <p className="text-sm text-gray-500 mb-6">Escolha uma senha com no mínimo 8 caracteres.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="password"
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            type="password"
            label="Confirmar senha"
            placeholder="Repita a nova senha"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Salvar nova senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Card><CardContent className="py-14 text-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </CardContent></Card>}>
      <ResetPasswordHandler />
    </Suspense>
  )
}
