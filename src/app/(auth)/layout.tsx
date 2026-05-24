import { Logo } from '@/components/brand/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-night-800 flex items-center justify-center px-4 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-night bg-grid-32 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-brand-500/15 blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <a href="/" aria-label="Redirect Grupo — Início" className="inline-flex">
            <Logo variant="vertical" tone="neon" size="lg" />
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
