import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="py-24 bg-brand-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Pronto para automatizar seus grupos?
        </h2>
        <p className="text-brand-100 text-lg mb-10">
          Configure em minutos. Sem contrato, sem burocracia.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="secondary" className="shadow-xl">
            Criar conta grátis agora
          </Button>
        </Link>
      </div>
    </section>
  )
}
