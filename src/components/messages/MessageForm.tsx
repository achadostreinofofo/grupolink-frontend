'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Image as ImageIcon, Loader2, Paperclip, X } from 'lucide-react'

const schema = z.object({
  title:   z.string().min(2, 'Título obrigatório'),
  content: z.string().min(1, 'Mensagem obrigatória'),
})

export type MessageFormValues = z.infer<typeof schema> & { mediaUrl?: string }

interface Props {
  defaultValues?: Partial<MessageFormValues>
  submitLabel?: string
  onSubmit: (values: MessageFormValues) => void
  submitting?: boolean
}

export function MessageForm({ defaultValues, submitLabel = 'Salvar', onSubmit, submitting }: Props) {
  const [mediaUrl, setMediaUrl]     = useState(defaultValues?.mediaUrl ?? '')
  const [uploading, setUploading]   = useState(false)
  const [uploadErr, setUploadErr]   = useState('')
  const [preview, setPreview]       = useState(defaultValues?.mediaUrl ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: defaultValues?.title ?? '', content: defaultValues?.content ?? '' },
  })

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('A imagem deve ter no máximo 5 MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      setUploadErr('Somente imagens são aceitas')
      return
    }

    setUploadErr('')
    setUploading(true)
    try {
      const { url } = await api.upload.image(file)
      setMediaUrl(url)
      setPreview(url)
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = () => { setMediaUrl(''); setPreview(''); setUploadErr('') }

  const onValid = (data: z.infer<typeof schema>) =>
    onSubmit({ ...data, mediaUrl: mediaUrl || undefined })

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
        <textarea
          rows={5}
          placeholder="Texto da mensagem (emojis são suportados ✅)"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-y"
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>

      {/* Image attachment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem anexada (opcional)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          A imagem será enviada junto com o texto em uma única mensagem. Máximo 5 MB.
        </p>

        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                : <><Paperclip className="w-4 h-4" /> Selecionar imagem</>
              }
            </button>
            {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
          </div>
        )}

        {preview && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Imagem anexada
          </p>
        )}
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
