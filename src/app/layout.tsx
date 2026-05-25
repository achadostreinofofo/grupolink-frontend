import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import Script from 'next/script'
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
      <body>
        {children}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1003534992204629');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1003534992204629&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
