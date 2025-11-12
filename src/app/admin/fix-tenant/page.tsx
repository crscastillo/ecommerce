'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function FixTenantPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fixTenant = async () => {
    setLoading(true)
    setStatus('')
    
    try {
      const response = await fetch('/api/fix-peakmode-languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus('✅ Success: ' + data.message)
      } else {
        setStatus('❌ Error: ' + data.error)
      }
    } catch (error) {
      setStatus('❌ Network error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fix Peakmode Tenant Languages</h1>
      
      <div className="bg-blue-100 p-4 rounded">
        <p><strong>This will set:</strong></p>
        <ul className="list-disc ml-6">
          <li>admin_language = 'en' (English for admin interface)</li>
          <li>store_language = 'es' (Spanish for public store)</li>
        </ul>
      </div>

      <Button 
        onClick={fixTenant}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Updating...' : 'Fix Tenant Languages'}
      </Button>

      {status && (
        <div className={`p-4 rounded ${
          status.startsWith('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  )
}