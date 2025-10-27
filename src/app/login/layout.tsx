import type { Metadata } from 'next'
import { platformConfig } from '@/lib/config/platform'

export const metadata: Metadata = {
  title: `Sign In - ${platformConfig.name}`,
  description: `Sign in to your ${platformConfig.name} account to manage your online store.`,
  openGraph: {
    title: `Sign In - ${platformConfig.name}`,
    description: `Sign in to your ${platformConfig.name} account to manage your online store.`,
    siteName: platformConfig.name,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}