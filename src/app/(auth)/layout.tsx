export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />
      <div className="absolute top-1/4 -left-32 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00E5FF, transparent)' }} />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-900 font-black"
              style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)' }}>R</span>
            <span className="gradient-text">Redirect Grupo</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
