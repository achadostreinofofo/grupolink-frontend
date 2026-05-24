import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-night-800">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 text-night-50">
        {children}
      </main>
    </div>
  )
}
