import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectGroupsModal } from '../SelectGroupsModal'
import type { Group } from '@/types'

jest.mock('@/lib/api', () => ({
  api: {
    structures: {
      get: jest.fn(),
    },
  },
}))

const makeGroup = (id: string, name: string, status: Group['status'] = 'ACTIVE'): Group => ({
  id,
  name,
  inviteLink: 'https://chat.whatsapp.com/test',
  memberCount: 50,
  maxMembers: 100,
  capacityPercentage: 0.5,
  clickCount: 10,
  status,
  sortOrder: 0,
  whatsappGroupId: null,
})

const mockGroups = [makeGroup('g1', 'Grupo A'), makeGroup('g2', 'Grupo B', 'FULL')]

const defaultProps = {
  open: true,
  structureId: 'str-1',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  const { api } = require('@/lib/api')
  api.structures.get.mockResolvedValue({
    id: 'str-1',
    groups: mockGroups,
  })
})

describe('SelectGroupsModal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<SelectGroupsModal {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal title', () => {
    render(<SelectGroupsModal {...defaultProps} />)
    expect(screen.getByText('Para quais grupos enviar?')).toBeInTheDocument()
  })

  it('renders "Todos os grupos" toggle active by default', () => {
    render(<SelectGroupsModal {...defaultProps} />)
    expect(screen.getByText('Todos os grupos')).toBeInTheDocument()
    expect(screen.getByText('Selecionar grupos')).toBeInTheDocument()
  })

  it('calls onConfirm with empty array when "Enviar para todos" clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<SelectGroupsModal {...defaultProps} onConfirm={onConfirm} />)

    await waitFor(() => screen.getByRole('button', { name: /enviar para todos/i }))
    await user.click(screen.getByRole('button', { name: /enviar para todos/i }))

    expect(onConfirm).toHaveBeenCalledWith([])
  })

  it('shows group list when "Selecionar grupos" toggled', async () => {
    const user = userEvent.setup()
    render(<SelectGroupsModal {...defaultProps} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => expect(screen.getByText('Grupo A')).toBeInTheDocument())
  })

  it('shows group status badges', async () => {
    const user = userEvent.setup()
    render(<SelectGroupsModal {...defaultProps} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => {
      expect(screen.getByText('Ativo')).toBeInTheDocument()
      expect(screen.getByText('Cheio')).toBeInTheDocument()
    })
  })

  it('can select individual groups', async () => {
    const user = userEvent.setup()
    render(<SelectGroupsModal {...defaultProps} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => screen.getByText('Grupo A'))
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()
  })

  it('calls onConfirm with selected group ids', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<SelectGroupsModal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => screen.getByText('Grupo A'))
    await user.click(screen.getAllByRole('checkbox')[0])
    await user.click(screen.getByRole('button', { name: /enviar para 1 grupo/i }))
    expect(onConfirm).toHaveBeenCalledWith(['g1'])
  })

  it('shows "Selecionar todos" toggle in group list', async () => {
    const user = userEvent.setup()
    render(<SelectGroupsModal {...defaultProps} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => expect(screen.getByText('Selecionar todos')).toBeInTheDocument())
  })

  it('"Selecionar todos" selects all groups', async () => {
    const user = userEvent.setup()
    render(<SelectGroupsModal {...defaultProps} />)
    await user.click(screen.getByText('Selecionar grupos'))
    await waitFor(() => screen.getByText('Selecionar todos'))
    await user.click(screen.getByText('Selecionar todos'))
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(cb => expect(cb).toBeChecked())
  })

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<SelectGroupsModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
