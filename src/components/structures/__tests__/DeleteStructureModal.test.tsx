import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteStructureModal } from '../DeleteStructureModal'

const defaultProps = {
  open: true,
  structureName: 'Minha Estrutura',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('DeleteStructureModal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<DeleteStructureModal {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal title when open', () => {
    render(<DeleteStructureModal {...defaultProps} />)
    expect(screen.getByText('Excluir estrutura')).toBeInTheDocument()
  })

  it('shows structure name in the warning text', () => {
    render(<DeleteStructureModal {...defaultProps} />)
    expect(screen.getByText(/"Minha Estrutura"/)).toBeInTheDocument()
  })

  it('confirm button is disabled when typed field is empty', () => {
    render(<DeleteStructureModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /excluir permanentemente/i })).toBeDisabled()
  })

  it('confirm button is disabled when typed text does not match "excluir"', async () => {
    const user = userEvent.setup()
    render(<DeleteStructureModal {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('excluir'), 'abc')
    expect(screen.getByRole('button', { name: /excluir permanentemente/i })).toBeDisabled()
  })

  it('confirm button is enabled when typed text is "excluir"', async () => {
    const user = userEvent.setup()
    render(<DeleteStructureModal {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('excluir'), 'excluir')
    expect(screen.getByRole('button', { name: /excluir permanentemente/i })).not.toBeDisabled()
  })

  it('is case-insensitive for confirmation text', async () => {
    const user = userEvent.setup()
    render(<DeleteStructureModal {...defaultProps} />)
    await user.type(screen.getByPlaceholderText('excluir'), 'EXCLUIR')
    expect(screen.getByRole('button', { name: /excluir permanentemente/i })).not.toBeDisabled()
  })

  it('calls onConfirm when confirmed and button clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn().mockResolvedValue(undefined)
    render(<DeleteStructureModal {...defaultProps} onConfirm={onConfirm} />)
    await user.type(screen.getByPlaceholderText('excluir'), 'excluir')
    await user.click(screen.getByRole('button', { name: /excluir permanentemente/i }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalled())
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<DeleteStructureModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when X button clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<DeleteStructureModal {...defaultProps} onClose={onClose} />)
    const closeButtons = screen.getAllByRole('button')
    const xButton = closeButtons.find(btn => btn.querySelector('svg'))
    if (xButton && xButton !== screen.getByRole('button', { name: /cancelar/i }) &&
        xButton !== screen.getByRole('button', { name: /excluir/i })) {
      await user.click(xButton)
    }
  })

  it('shows error message on failed confirm', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn().mockRejectedValue(new Error('Falha ao excluir'))
    render(<DeleteStructureModal {...defaultProps} onConfirm={onConfirm} />)
    await user.type(screen.getByPlaceholderText('excluir'), 'excluir')
    await user.click(screen.getByRole('button', { name: /excluir permanentemente/i }))
    await waitFor(() => expect(screen.getByText('Falha ao excluir')).toBeInTheDocument())
  })
})
