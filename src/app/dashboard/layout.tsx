import { Sidebar } from '@/components/dashboard/Sidebar'
import { TrialBanner } from '@/components/dashboard/TrialBanner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TrialBanner />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
