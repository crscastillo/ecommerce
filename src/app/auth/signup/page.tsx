'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSignUp() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the main signup page with tenant creation
    router.replace('/signup')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p>Redirecting to signup...</p>
      </div>
    </div>
  )
}