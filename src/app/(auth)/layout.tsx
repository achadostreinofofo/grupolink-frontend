export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 font-bold text-xl text-gray-900">
            <span className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">G</span>
            GrupoLink
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
