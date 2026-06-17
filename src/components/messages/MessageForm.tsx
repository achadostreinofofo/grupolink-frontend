'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Link, Loader2, Paperclip, RefreshCw, Sparkles, X } from 'lucide-react'

const schema = z.object({
  title:   z.string().min(2, 'Título obrigatório'),
  content: z.string().min(1, 'Mensagem obrigatória'),
})

// file  = arquivo novo selecionado (ainda não enviado ao S3)
// mediaUrl = URL já existente no S3 (modo edição)
export type MessageFormValues = z.infer<typeof schema> & {
  file?: File
  mediaUrl?: string
}

interface Props {
  defaultValues?: Partial<MessageFormValues>
  submitLabel?: string
  onSubmit: (values: MessageFormValues) => void
  submitting?: boolean
}

export function MessageForm({ defaultValues, submitLabel = 'Salvar', onSubmit, submitting }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  // Local file chosen by the user (not yet uploaded)
  const [file, setFile]       = useState<File | null>(null)
  // Object URL for local preview
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  // Existing S3 URL (edit mode)
  const [existingUrl, setExistingUrl] = useState(defaultValues?.mediaUrl ?? '')
  const [fileErr, setFileErr] = useState('')

  // AI text generation from affiliate link
  const [affiliateLink, setAffiliateLink] = useState('')
  const [generating, setGenerating]       = useState(false)
  const [generateErr, setGenerateErr]     = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: defaultValues?.title ?? '', content: defaultValues?.content ?? '' },
  })

  const previewSrc = localUrl ?? existingUrl ?? null

  useEffect(() => {
    const trimmed = affiliateLink.trim()
    if (!trimmed) return

    // cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      setGenerating(true)
      setGenerateErr('')
      try {
        const res = await api.messages.generateFromLink(trimmed)
        if (!controller.signal.aborted) {
          setValue('content', res.content)
          if (res.title) {
            setValue('title', res.title, { shouldValidate: true })
          }
          if (res.imageUrl) {
            setFile(null)
            setLocalUrl(null)
            setExistingUrl(res.imageUrl)
          }
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setGenerateErr(e instanceof Error ? e.message : 'Não foi possível processar o link')
        }
      } finally {
        if (!controller.signal.aborted) setGenerating(false)
      }
    }, 600)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [affiliateLink, setValue])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0]
    if (!chosen) return

    setFileErr('')

    if (chosen.size > 5 * 1024 * 1024) {
      setFileErr('A imagem deve ter no máximo 5 MB')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (!chosen.type.startsWith('image/')) {
      setFileErr('Somente imagens são aceitas (JPEG, PNG, GIF, WEBP)')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    // Revoke previous object URL to avoid memory leak
    if (localUrl) URL.revokeObjectURL(localUrl)

    const objUrl = URL.createObjectURL(chosen)
    setFile(chosen)
    setLocalUrl(objUrl)
    setExistingUrl('')           // novo arquivo sobrepõe URL existente
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = () => {
    if (localUrl) URL.revokeObjectURL(localUrl)
    setFile(null)
    setLocalUrl(null)
    setExistingUrl('')
    setFileErr('')
  }

  const onValid = (data: z.infer<typeof schema>) =>
    onSubmit({
      ...data,
      file:     file ?? undefined,
      mediaUrl: existingUrl || undefined,
    })

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5">
      <Input
        id="title"
        label="Título"
        placeholder="Ex: Promoção de segunda-feira"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* AI generation from affiliate link */}
      <div className="rounded-xl border border-brand-500/20 bg-night-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-night-100">Gerar texto com IA</span>
          <span className="text-xs text-night-400">(opcional)</span>
        </div>
        <p className="text-xs text-night-400">
          Cole um link de produto do Mercado Livre ou da Amazon e a IA vai montar um texto persuasivo automaticamente.
        </p>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night-400 pointer-events-none" />
          <input
            type="url"
            value={affiliateLink}
            onChange={e => { setAffiliateLink(e.target.value); setGenerateErr('') }}
            placeholder="https://meli.la/... ou https://amzn.to/..."
            disabled={generating}
            className="w-full rounded-xl border border-night-600 bg-night-700 pl-9 pr-4 py-2.5 text-sm text-night-50 placeholder:text-night-500 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
          />
          {generating && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 animate-spin" />
          )}
        </div>
        {generating && (
          <p className="text-xs text-brand-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Buscando produto e gerando texto...
          </p>
        )}
        {generateErr && (
          <p className="text-xs text-red-400">{generateErr}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-night-200 mb-1">Mensagem</label>
        <textarea
          rows={5}
          placeholder="Texto da mensagem (emojis são suportados ✅)"
          disabled={generating}
          className="w-full rounded-xl border border-night-600 bg-night-700 px-4 py-3 text-sm text-night-50 placeholder:text-night-500 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>

      {/* Image attachment */}
      <div>
        <label className="block text-sm font-medium text-night-200 mb-1">
          Imagem anexada (opcional)
        </label>
        <p className="text-xs text-night-400 mb-3">
          Será enviada junto com o texto em uma única mensagem. Máximo 5 MB.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <div className="flex items-center gap-3">
          {/* Thumbnail — shown when any image is selected/exists */}
          {previewSrc && (
            <div className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Preview da imagem"
                className="w-16 h-16 object-cover rounded-xl border border-night-600 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remover imagem"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Button — always visible */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-night-600 text-sm text-night-300 hover:border-brand-400 hover:text-brand-600 transition-colors"
          >
            {previewSrc
              ? <><RefreshCw className="w-4 h-4" /> Trocar imagem</>
              : <><Paperclip className="w-4 h-4" /> Selecionar imagem</>
            }
          </button>
        </div>

        {file && (
          <p className="text-xs text-night-400 mt-1.5 ml-0.5">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}

        {fileErr && <p className="text-xs text-red-500 mt-1.5">{fileErr}</p>}
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
