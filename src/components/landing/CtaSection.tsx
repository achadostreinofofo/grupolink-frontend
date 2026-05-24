import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-night-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-night bg-grid-32 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent"
      />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
          Pronto para <span className="text-neon">redirecionar</span> seus grupos?
        </h2>
        <p className="text-night-100 text-lg mb-10">
          Configure em minutos. Sem contrato, sem burocracia.
        </p>
        <Link href="/signup">
          <Button size="lg" className="shadow-neon-lg">
            Criar conta grátis agora
          </Button>
        </Link>
      </div>
    </section>
  )
}
