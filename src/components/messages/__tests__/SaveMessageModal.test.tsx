import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveMessageModal } from '../SaveMessageModal'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: { structures: { scheduleSlots: jest.fn().mockResolvedValue([]) } },
}))

const defaultProps = {
  open: true,
  saving: false,
  structureId: 'struct-1',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('SaveMessageModal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<SaveMessageModal {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal title when open', () => {
    render(<SaveMessageModal {...defaultProps} />)
    expect(screen.getByText('O que deseja fazer?')).toBeInTheDocument()
  })

  it('renders all three action options', () => {
    render(<SaveMessageModal {...defaultProps} />)
    expect(screen.getByText('Salvar rascunho')).toBeInTheDocument()
    expect(screen.getByText('Agendar envio')).toBeInTheDocument()
    expect(screen.getByText('Enviar agora')).toBeInTheDocument()
  })

  it('confirm button is disabled when nothing is selected', () => {
    render(<SaveMessageModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled()
  })

  it('enables confirm button after selecting an option', async () => {
    const user = userEvent.setup()
    render(<SaveMessageModal {...defaultProps} />)
    await user.click(screen.getByText('Salvar rascunho'))
    expect(screen.getByRole('button', { name: /confirmar/i })).not.toBeDisabled()
  })

  it('calls onConfirm with "draft" when draft selected', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<SaveMessageModal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('Salvar rascunho'))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledWith('draft', undefined)
  })

  it('calls onConfirm with "send_now" when send now selected', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<SaveMessageModal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('Enviar agora'))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledWith('send_now', undefined)
  })

  it('shows the slot picker when schedule is selected', async () => {
    const user = userEvent.setup()
    render(<SaveMessageModal {...defaultProps} />)
    await user.click(screen.getByText('Agendar envio'))
    expect(screen.getByText('Escolha o dia e um horário disponível')).toBeInTheDocument()
  })

  it('shows error when schedule confirmed without a slot', async () => {
    const user = userEvent.setup()
    render(<SaveMessageModal {...defaultProps} />)
    await user.click(screen.getByText('Agendar envio'))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(screen.getByText('Escolha um horário disponível')).toBeInTheDocument()
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<SaveMessageModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('confirm button shows loading when saving=true', () => {
    render(<SaveMessageModal {...defaultProps} saving={true} />)
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled()
  })

  it('calls onConfirm with the picked slot when scheduling', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    ;(api.structures.scheduleSlots as jest.Mock).mockResolvedValue([
      { time: '08:00', datetime: '2099-01-15T08:00', available: true, status: 'AVAILABLE' },
    ])
    const { container } = render(<SaveMessageModal {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('Agendar envio'))

    // navega para o próximo mês (sempre futuro) e escolhe o dia 15
    const nextBtn = container.querySelector('.lucide-chevron-right')!.closest('button')!
    await user.click(nextBtn)
    await user.click(screen.getByRole('button', { name: '15' }))

    const slot = await screen.findByRole('button', { name: '08:00' })
    await user.click(slot)

    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledWith('schedule', '2099-01-15T08:00')
  })
})
