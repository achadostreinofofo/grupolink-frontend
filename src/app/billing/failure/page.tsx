import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento não realizado</h1>
        <p className="text-gray-500 mb-8">
          Houve um problema ao processar seu pagamento. Nenhum valor foi cobrado.
          Tente novamente ou entre em contato com o suporte.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/billing">
            <Button className="w-full">Tentar novamente</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full">Voltar ao dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
