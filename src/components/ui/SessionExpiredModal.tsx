'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuth } from '@/lib/auth'
import { Button } from './Button'

export function SessionExpiredModal() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handle = () => setVisible(true)
    window.addEventListener('session-expired', handle)
    return () => window.removeEventListener('session-expired', handle)
  }, [])

  function handleClose() {
    clearAuth()
    setVisible(false)
    router.push('/login')
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-night-700 border border-night-500 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-night-600 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-night-50">Sessão expirada</h2>
            <p className="text-sm text-night-300 mt-1">
              Sua sessão foi encerrada. Faça login novamente para continuar.
            </p>
          </div>
          <Button className="w-full mt-2" onClick={handleClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
