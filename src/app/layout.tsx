import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Redirect Grupo — Automatize seus grupos WhatsApp',
  description: 'Plataforma para afiliados gerenciarem grupos WhatsApp com redirecionamento inteligente, analytics avançado e automação de escala.',
  metadataBase: new URL('https://www.redirectgrupo.com.br'),
  openGraph: {
    title: 'Redirect Grupo',
    description: 'Um link, centenas de grupos. Distribua membros automaticamente com tecnologia de ponta.',
    siteName: 'Redirect Grupo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
