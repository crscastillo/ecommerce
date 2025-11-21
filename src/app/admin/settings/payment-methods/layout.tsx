import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Methods - Settings',
  description: 'Configure and manage payment methods for your store',
}

export default function PaymentMethodsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}