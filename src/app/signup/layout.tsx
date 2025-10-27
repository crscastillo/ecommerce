import type { Metadata } from 'next'
import { platformConfig } from '@/lib/config/platform'

export const metadata: Metadata = {
  title: `Create Store - ${platformConfig.name}`,
  description: `Create your own online store with ${platformConfig.name}. Start selling online in minutes.`,
  openGraph: {
    title: `Create Store - ${platformConfig.name}`,
    description: `Create your own online store with ${platformConfig.name}. Start selling online in minutes.`,
    siteName: platformConfig.name,
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}