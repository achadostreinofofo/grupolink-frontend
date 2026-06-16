import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-night-800">
      <Sidebar />
      {/* No mobile/tablet há uma top bar fixa (h-14) — o pt-16 evita que o conteúdo fique embaixo dela.
          A partir de lg, o Sidebar é fixo (w-60) e o conteúdo recebe a margem. */}
      <main className="flex-1 lg:ml-60 px-4 pb-6 pt-16 lg:p-8 text-night-50">
        {children}
      </main>
    </div>
  )
}
