import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageForm } from '../MessageForm'

jest.mock('@/lib/api', () => ({
  api: { messages: { generateFromLink: jest.fn() } },
}))
import { api } from '@/lib/api'
const mockGenerate = api.messages.generateFromLink as jest.Mock

const mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/fake-url')
const mockRevokeObjectURL = jest.fn()
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

function makeFile(name = 'photo.jpg', type = 'image/jpeg', size = 1024): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

describe('MessageForm', () => {
  it('renders the title input', () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
  })

  it('renders the content textarea', () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    expect(screen.getByPlaceholderText(/Texto da mensagem/)).toBeInTheDocument()
  })

  it('renders submit button with default label "Salvar"', () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('renders custom submit label', () => {
    render(<MessageForm onSubmit={jest.fn()} submitLabel="Publicar" />)
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })

  it('prefills title, content and image from generated product data', async () => {
    mockGenerate.mockResolvedValue({
      content: 'Texto gerado',
      title: 'Whey Protein 900g',
      imageUrl: 'https://cdn/img.webp',
    })
    const user = userEvent.setup()
    render(<MessageForm onSubmit={jest.fn()} />)

    await user.type(screen.getByPlaceholderText(/meli\.la/i), 'https://meli.la/abc')

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Whey Protein 900g')
    }, { timeout: 2000 })
    expect(screen.getByPlaceholderText(/Texto da mensagem/)).toHaveValue('Texto gerado')
  })

  it('fills default values', () => {
    render(<MessageForm onSubmit={jest.fn()} defaultValues={{ title: 'Meu título', content: 'Meu texto' }} />)
    expect(screen.getByLabelText('Título')).toHaveValue('Meu título')
    expect(screen.getByPlaceholderText(/Texto da mensagem/)).toHaveValue('Meu texto')
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSubmit={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(screen.getByText('Título obrigatório')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with form values on valid submission', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MessageForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Título'), 'Promoção')
    await user.type(screen.getByPlaceholderText(/Texto da mensagem/), 'Confira!')
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Promoção',
        content: 'Confira!',
      }))
    })
  })

  it('shows "Selecionar imagem" button', () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    expect(screen.getByText(/Selecionar imagem/)).toBeInTheDocument()
  })

  it('shows existing image preview when mediaUrl provided', () => {
    render(<MessageForm onSubmit={jest.fn()} defaultValues={{ mediaUrl: 'https://cdn.test/image.jpg' }} />)
    const img = screen.getByAltText('Preview da imagem')
    expect(img).toHaveAttribute('src', 'https://cdn.test/image.jpg')
  })

  it('shows "Trocar imagem" when image is selected', () => {
    render(<MessageForm onSubmit={jest.fn()} defaultValues={{ mediaUrl: 'https://cdn.test/image.jpg' }} />)
    expect(screen.getByText(/Trocar imagem/)).toBeInTheDocument()
  })

  it('removes image when remove button clicked', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSubmit={jest.fn()} defaultValues={{ mediaUrl: 'https://cdn.test/image.jpg' }} />)
    await user.click(screen.getByLabelText('Remover imagem'))
    expect(screen.queryByAltText('Preview da imagem')).not.toBeInTheDocument()
  })

  it('shows error for files exceeding 5MB', () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    const bigFile = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [bigFile] } })
    expect(screen.getByText('A imagem deve ter no máximo 5 MB')).toBeInTheDocument()
  })

  it('shows error for non-image file types', async () => {
    render(<MessageForm onSubmit={jest.fn()} />)
    const pdfFile = makeFile('doc.pdf', 'application/pdf', 1024)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [pdfFile] } })
    expect(screen.getByText('Somente imagens são aceitas (JPEG, PNG, GIF, WEBP)')).toBeInTheDocument()
  })

  it('shows file name and size after valid image selection', async () => {
    const user = userEvent.setup()
    render(<MessageForm onSubmit={jest.fn()} />)
    const imgFile = makeFile('test.jpg', 'image/jpeg', 2048)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [imgFile] } })
    await waitFor(() => expect(screen.getByText(/test\.jpg/)).toBeInTheDocument())
  })

  it('passes file in onSubmit when an image is selected', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<MessageForm onSubmit={onSubmit} />)
    const imgFile = makeFile('img.jpg', 'image/jpeg', 1024)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [imgFile] } })
    await user.type(screen.getByLabelText('Título'), 'Com imagem')
    await user.type(screen.getByPlaceholderText(/Texto da mensagem/), 'Texto')
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ file: imgFile }))
    })
  })

  it('shows loading state on submit button when submitting', () => {
    render(<MessageForm onSubmit={jest.fn()} submitting={true} />)
    expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled()
  })
})
