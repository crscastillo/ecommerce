'use client'

import { useEffect, useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'

export default function TranslationDebugPage() {
  const { tenant } = useTenant()
  const t = useTranslations('settings')
  const [headers, setHeaders] = useState<any>(null)

  useEffect(() => {
    fetch('/api/debug-headers')
      .then(res => res.json())
      .then(data => setHeaders(data))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Translation Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Translation Test</h2>
        <p><strong>t('tabs.store'):</strong> "{t('tabs.store')}"</p>
        <p><strong>t('sections.storeInformation'):</strong> "{t('sections.storeInformation')}"</p>
        <p><strong>t('labels.storeName'):</strong> "{t('labels.storeName')}"</p>
        <p><strong>t('roles.owner'):</strong> "{t('roles.owner')}"</p>
        <p><strong>t('header.visitStore'):</strong> "{t('header.visitStore')}"</p>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Tenant Information</h2>
        <p><strong>Tenant Name:</strong> {tenant?.name}</p>
        <p><strong>Admin Language:</strong> {(tenant as any)?.admin_language || 'Not set'}</p>
        <p><strong>Store Language:</strong> {(tenant as any)?.store_language || 'Not set'}</p>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Headers from Middleware</h2>
        <pre>{JSON.stringify(headers, null, 2)}</pre>
      </div>
    </div>
  )
}