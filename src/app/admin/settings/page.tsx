'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { SettingsProvider } from '@/lib/contexts/settings-context'
import { SettingsContent } from '@/components/admin/settings/settings-content'

export default function SettingsPage() {
  const { tenant, isLoading: tenantLoading, error } = useTenant()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Track when component is mounted to prevent SSR flash
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted (prevents SSR flash)
  if (!mounted) {
    return null
  }

  // Show tenant loading state
  if (tenantLoading || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  // Show tenant error state only if there's an actual error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>{error || 'Settings require access via your store subdomain.'}</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
      <SettingsContent 
        tenant={tenant}
        searchParams={searchParams}
        router={router}
      />
    </SettingsProvider>
  )
}