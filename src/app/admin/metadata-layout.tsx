import type { Metadata } from 'next'
import { platformConfig } from '@/lib/config/platform'

export const metadata: Metadata = {
  title: `Admin Dashboard - ${platformConfig.name}`,
  description: `Manage your online store with ${platformConfig.name}. View analytics, manage products, and handle orders.`,
  openGraph: {
    title: `Admin Dashboard - ${platformConfig.name}`,
    description: `Manage your online store with ${platformConfig.name}. View analytics, manage products, and handle orders.`,
    siteName: platformConfig.name,
  },
}

export default function AdminMetadataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}