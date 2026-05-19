import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PendingActionsCard } from '../PendingActionsCard'
import type { PendingAction } from '@/types'

jest.mock('@/lib/api', () => ({
  api: {
    dashboard: {
      updateGroup: jest.fn(),
    },
  },
}))

const mockAction: PendingAction = {
  groupId: 'grp-1',
  groupName: 'Grupo Vendas 1',
  structureId: 'str-1',
  structureName: 'Vendas',
  structureSlug: 'vendas',
  sortOrder: 0,
  createdAt: '2024-01-01T00:00:00Z',
}

describe('PendingActionsCard', () => {
  it('renders nothing when actions is empty', () => {
    const { container } = render(<PendingActionsCard actions={[]} onActionCompleted={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the card with pending actions count', () => {
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    expect(screen.getByText('Ações Pendentes')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders action group name', () => {
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    expect(screen.getByText('Grupo Vendas 1')).toBeInTheDocument()
  })

  it('renders structure name and sort order', () => {
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    expect(screen.getAllByText(/Vendas/).length).toBeGreaterThan(0)
    expect(screen.getByText(/#1/)).toBeInTheDocument()
  })

  it('shows "Adicionar link de convite" button initially', () => {
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    expect(screen.getByRole('button', { name: /adicionar link de convite/i })).toBeInTheDocument()
  })

  it('shows form when clicking "Adicionar link de convite"', async () => {
    const user = userEvent.setup()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    expect(screen.getByPlaceholderText(/https:\/\/chat.whatsapp.com\//)).toBeInTheDocument()
  })

  it('shows cancel button in form', async () => {
    const user = userEvent.setup()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('hides form when clicking cancel', async () => {
    const user = userEvent.setup()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByRole('button', { name: /adicionar link de convite/i })).toBeInTheDocument()
  })

  it('calls onActionCompleted after successful form submission', async () => {
    const { api } = await import('@/lib/api')
    ;(api.dashboard.updateGroup as jest.Mock).mockResolvedValueOnce({})

    const user = userEvent.setup()
    const onCompleted = jest.fn()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={onCompleted} />)

    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    await user.type(screen.getByPlaceholderText(/https:\/\/chat.whatsapp.com\//), 'https://chat.whatsapp.com/abc123')
    await user.click(screen.getByRole('button', { name: /ativar/i }))

    await waitFor(() => expect(onCompleted).toHaveBeenCalled())
  })

  it('shows error message on failed submission', async () => {
    const { api } = await import('@/lib/api')
    ;(api.dashboard.updateGroup as jest.Mock).mockRejectedValueOnce(new Error('Link inválido'))

    const user = userEvent.setup()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    await user.type(screen.getByPlaceholderText(/https:\/\/chat.whatsapp.com\//), 'https://chat.whatsapp.com/abc123')
    await user.click(screen.getByRole('button', { name: /ativar/i }))

    await waitFor(() => expect(screen.getByText('Link inválido')).toBeInTheDocument())
  })

  it('shows validation error for invalid URL', async () => {
    const user = userEvent.setup()
    render(<PendingActionsCard actions={[mockAction]} onActionCompleted={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /adicionar link de convite/i }))
    await user.type(screen.getByPlaceholderText(/https:\/\/chat.whatsapp.com\//), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /ativar/i }))

    await waitFor(() => expect(screen.getByText(/URL inválida/i)).toBeInTheDocument())
  })

  it('renders multiple pending actions', () => {
    const action2: PendingAction = { ...mockAction, groupId: 'grp-2', groupName: 'Grupo Vendas 2' }
    render(<PendingActionsCard actions={[mockAction, action2]} onActionCompleted={jest.fn()} />)
    expect(screen.getByText('Grupo Vendas 1')).toBeInTheDocument()
    expect(screen.getByText('Grupo Vendas 2')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
