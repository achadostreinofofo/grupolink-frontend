import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveMessageModal } from '../SaveMessageModal'

const defaultProps = {
  open: true,
  saving: false,
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

  it('shows datetime input when schedule is selected', async () => {
    const user = userEvent.setup()
    const { container } = render(<SaveMessageModal {...defaultProps} />)
    await user.click(screen.getByText('Agendar envio'))
    expect(screen.getByText('Data e hora de envio')).toBeInTheDocument()
    expect(container.querySelector('input[type="datetime-local"]')).toBeInTheDocument()
  })

  it('shows error when schedule confirmed without a date', async () => {
    const user = userEvent.setup()
    render(<SaveMessageModal {...defaultProps} />)
    await user.click(screen.getByText('Agendar envio'))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(screen.getByText('Informe a data e hora')).toBeInTheDocument()
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

  it('calls onConfirm with schedule action and date when valid date entered', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<SaveMessageModal {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('Agendar envio'))

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const dateStr = futureDate.toISOString().slice(0, 16)
    const dateInput = screen.getByDisplayValue('')
    await user.type(dateInput, dateStr)

    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('schedule', dateStr)
    })
  })
})
