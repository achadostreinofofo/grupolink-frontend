import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailNotVerifiedModal } from '../EmailNotVerifiedModal'

jest.mock('@/lib/api', () => ({
  api: { auth: { resendVerification: jest.fn() } },
}))
import { api } from '@/lib/api'
const mockResend = api.auth.resendVerification as jest.Mock

describe('EmailNotVerifiedModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not render when closed', () => {
    const { container } = render(<EmailNotVerifiedModal open={false} email="a@b.com" onClose={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the email and resends the confirmation', async () => {
    mockResend.mockResolvedValue({ message: 'ok' })
    const user = userEvent.setup()
    render(<EmailNotVerifiedModal open email="user@test.com" onClose={jest.fn()} />)

    expect(screen.getByText('user@test.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reenviar e-mail/i }))

    await waitFor(() => expect(mockResend).toHaveBeenCalledWith('user@test.com'))
    expect(await screen.findByText(/caixa de entrada/i)).toBeInTheDocument()
  })

  it('calls onClose when clicking Fechar', async () => {
    const onClose = jest.fn()
    const user = userEvent.setup()
    render(<EmailNotVerifiedModal open email="a@b.com" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows an error message when resend fails', async () => {
    mockResend.mockRejectedValue(new Error('Falhou'))
    const user = userEvent.setup()
    render(<EmailNotVerifiedModal open email="a@b.com" onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /reenviar e-mail/i }))
    expect(await screen.findByText('Falhou')).toBeInTheDocument()
  })
})
