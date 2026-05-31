'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Paperclip, RefreshCw, X } from 'lucide-react'

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

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: defaultValues?.title ?? '', content: defaultValues?.content ?? '' },
  })

  const previewSrc = localUrl ?? existingUrl ?? null

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

      <div>
        <label className="block text-sm font-medium text-night-200 mb-1">Mensagem</label>
        <textarea
          rows={5}
          placeholder="Texto da mensagem (emojis são suportados ✅)"
          className="w-full rounded-xl border border-night-600 bg-night-700 px-4 py-3 text-sm text-night-50 placeholder:text-night-500 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y"
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
