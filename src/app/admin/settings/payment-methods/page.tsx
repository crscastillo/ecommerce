'use client'

import { SettingsProvider } from '@/lib/contexts/settings-context'
import { PaymentMethodsContent } from '@/components/admin/settings/payment-methods/payment-methods-content'

export default function PaymentMethodsPage() {
  return (
    <SettingsProvider>
      <PaymentMethodsContent />
    </SettingsProvider>
  )
}