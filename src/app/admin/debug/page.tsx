'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'

export default function DebugPage() {
  const { tenant } = useTenant()
  const t = useTranslations('navigation')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetch('/api/debug-headers')
      .then(res => res.json())
      .then(setDebugInfo)
      .catch(console.error)
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Language Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Translations</h2>
        <p><strong>Dashboard:</strong> {t('dashboard')}</p>
        <p><strong>Products:</strong> {t('products')}</p>
        <p><strong>Settings:</strong> {t('settings')}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Tenant Settings</h2>
        <p><strong>Admin Language:</strong> {tenant?.admin_language || 'null'}</p>
        <p><strong>Store Language:</strong> {tenant?.store_language || 'null'}</p>
      </div>

      {debugInfo && (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Headers Debug</h2>
          <p><strong>x-locale:</strong> {debugInfo.locale}</p>
          <p><strong>x-tenant-id:</strong> {debugInfo.tenantId?.slice(0, 8)}...</p>
          <p><strong>x-tenant-name:</strong> {debugInfo.tenantName}</p>
        </div>
      )}
    </div>
  )
}