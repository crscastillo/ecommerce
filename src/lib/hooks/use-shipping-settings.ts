import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '@/lib/contexts/tenant-context'
import type { ShippingMethod } from '@/components/admin/settings/shipping-tab'

export function useShippingSettings() {
  const { tenant } = useTenant()
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load shipping settings
  const loadShippingSettings = async () => {
    if (!tenant?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/shipping-settings?tenant_id=${tenant.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load shipping settings')
      }

      setShippingMethods(data.shipping_methods || [])
    } catch (err: any) {
      console.error('Error loading shipping settings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Save shipping settings
  const saveShippingSettings = async (methods: ShippingMethod[]) => {
    if (!tenant?.id) {
      throw new Error('No tenant found')
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/shipping-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          shipping_methods: methods,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save shipping settings')
      }

      setShippingMethods(methods)
      return data
    } catch (err: any) {
      console.error('Error saving shipping settings:', err)
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Load settings when tenant changes
  useEffect(() => {
    loadShippingSettings()
  }, [tenant?.id])

  return {
    shippingMethods,
    setShippingMethods,
    loading,
    saving,
    error,
    saveShippingSettings,
    refreshShippingSettings: loadShippingSettings
  }
}