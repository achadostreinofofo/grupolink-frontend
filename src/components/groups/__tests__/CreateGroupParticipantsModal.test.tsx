import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateGroupParticipantsModal } from '../CreateGroupParticipantsModal'
import type { WebSessionStatus } from '@/types'

jest.mock('@/lib/api', () => ({
  api: {
    whatsappWeb: {
      listSessions: jest.fn(),
    },
  },
}))

jest.mock('next/link', () => {
  const MockLink = ({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <a href={href} className={className} onClick={onClick}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const makeSession = (sessionId: string, phone: string, status: WebSessionStatus['status'] = 'AUTHENTICATED'): WebSessionStatus => ({
  sessionId,
  status,
  qrBase64: null,
  phone,
})

const defaultProps = {
  open: true,
  groupName: 'Grupo Teste',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('CreateGroupParticipantsModal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<CreateGroupParticipantsModal {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal title when open', () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    expect(screen.getByText('Criar grupo no WhatsApp')).toBeInTheDocument()
  })

  it('shows group name in the subtitle', () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    expect(screen.getByText('Grupo Teste')).toBeInTheDocument()
  })

  it('shows warning when no sessions (0 accounts)', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => expect(screen.getByText(/Mínimo de 2 contas WhatsApp necessário/i)).toBeInTheDocument())
  })

  it('shows warning when only 1 authenticated session', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([makeSession('s1', '5511999999999')])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText(/Mínimo de 2 contas WhatsApp necessário/i)).toBeInTheDocument()
      expect(screen.getByText(/\+5511999999999/)).toBeInTheDocument()
    })
  })

  it('shows "Conectar conta" button when less than 2 sessions', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => expect(screen.getByRole('link', { name: /conectar conta/i })).toBeInTheDocument())
  })

  it('shows creator and participants sections with 2+ sessions', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([
      makeSession('s1', '5511111111111'),
      makeSession('s2', '5522222222222'),
    ])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Conta criadora (admin)')).toBeInTheDocument()
      expect(screen.getByText('Contas participantes')).toBeInTheDocument()
    })
  })

  it('pre-selects all sessions except the first', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([
      makeSession('s1', '5511111111111'),
      makeSession('s2', '5522222222222'),
    ])
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => screen.getByRole('checkbox'))
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
  })

  it('calls onConfirm with participant JIDs when "Criar grupo" clicked', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([
      makeSession('s1', '5511111111111'),
      makeSession('s2', '5522222222222'),
    ])
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<CreateGroupParticipantsModal {...defaultProps} onConfirm={onConfirm} />)
    await waitFor(() => screen.getByRole('button', { name: /criar grupo/i }))
    await user.click(screen.getByRole('button', { name: /criar grupo/i }))
    expect(onConfirm).toHaveBeenCalledWith(['5522222222222@s.whatsapp.net'])
  })

  it('can toggle participant selection', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([
      makeSession('s1', '5511111111111'),
      makeSession('s2', '5522222222222'),
    ])
    const user = userEvent.setup()
    render(<CreateGroupParticipantsModal {...defaultProps} />)
    await waitFor(() => screen.getByRole('checkbox'))
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getByRole('button', { name: /criar grupo/i })).toBeDisabled()
  })

  it('calls onClose when cancel button clicked', async () => {
    const { api } = require('@/lib/api')
    api.whatsappWeb.listSessions.mockResolvedValue([])
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<CreateGroupParticipantsModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
