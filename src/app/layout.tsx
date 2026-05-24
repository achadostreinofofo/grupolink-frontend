import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['500', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Redirect Grupo — Redirecionamento inteligente para grupos WhatsApp',
  description: 'Plataforma SaaS para afiliados gerenciarem grupos WhatsApp com redirecionamento inteligente, analytics em tempo real e automação completa.',
  metadataBase: new URL('https://redirectgrupo.com.br'),
  openGraph: {
    title: 'Redirect Grupo',
    description: 'Um link, toda sua estrutura de grupos WhatsApp. Redirecionamento inteligente, balanceamento e analytics.',
    url: 'https://redirectgrupo.com.br',
    siteName: 'Redirect Grupo',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${orbitron.variable}`}>
      <body>{children}</body>
    </html>
  )
}
