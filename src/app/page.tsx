'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.replace('/dashboard')
    }
  }, [router])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
