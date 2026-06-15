import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(<Input id="email" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error prop is set', () => {
    render(<Input error="Error!" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500', 'bg-red-900/20')
  })

  it('applies normal border when no error', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveClass('border-night-600', 'bg-night-600')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello world')
    expect(input).toHaveValue('hello world')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('INPUT')
  })

  it('passes HTML input props through', () => {
    render(<Input placeholder="Enter email" type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('merges custom className', () => {
    render(<Input className="w-64" />)
    expect(screen.getByRole('textbox')).toHaveClass('w-64')
  })

  it('associates label with input via id', () => {
    render(<Input id="name" label="Full Name" />)
    const label = screen.getByText('Full Name')
    expect(label).toHaveAttribute('for', 'name')
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('does not render error paragraph when no error', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  describe('password visibility toggle', () => {
    it('renders a toggle button for password inputs', () => {
      render(<Input type="password" label="Senha" id="pwd" />)
      expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument()
    })

    it('does not render a toggle for non-password inputs', () => {
      render(<Input type="text" />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('starts hidden (type=password) and toggles to text and back', async () => {
      const user = userEvent.setup()
      const { container } = render(<Input type="password" label="Senha" id="pwd" />)
      const input = container.querySelector('input')!
      expect(input).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
      expect(input).toHaveAttribute('type', 'text')

      await user.click(screen.getByRole('button', { name: /esconder senha/i }))
      expect(input).toHaveAttribute('type', 'password')
    })
  })
})
