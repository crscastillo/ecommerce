'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to settings with billing tab
    router.replace('/admin/settings?tab=billing')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to billing settings...</p>
      </div>
    </div>
  )
}