'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { CheckCircle, Mail, MessageSquare, User } from 'lucide-react'

const schema = z.object({
  name:    z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email:   z.string().email('E-mail inválido'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function ContatoPage() {
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const messageLen = watch('message')?.length ?? 0

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.contact.send(data)
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar mensagem. Tente novamente.')
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 mb-4">
              <Mail className="w-7 h-7 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Fale Conosco</h1>
            <p className="text-gray-500 mt-2 text-base">
              Tem alguma dúvida, sugestão ou quer saber mais sobre o GrupoLink?
              Preencha o formulário abaixo e responderemos em até 24 horas.
            </p>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mensagem enviada!</h2>
              <p className="text-gray-500 text-sm">
                Recebemos sua mensagem e responderemos em breve no e-mail informado.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-teal-600 hover:underline"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Nome
                    </span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      E-mail
                    </span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      Mensagem
                    </span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Descreva sua dúvida ou mensagem..."
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors ${
                      errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                    {...register('message')}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="text-xs text-red-500">{errors.message.message}</p>
                      : <span />
                    }
                    <span className={`text-xs ${messageLen > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {messageLen}/2000
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={isSubmitting} className="w-full">
                  Enviar mensagem
                </Button>
              </form>

              <p className="text-xs text-center text-gray-400 mt-5">
                Você também pode nos contatar diretamente em{' '}
                <a href="mailto:contato@redirectgrupo.com.br" className="text-teal-600 hover:underline">
                  contato@redirectgrupo.com.br
                </a>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
