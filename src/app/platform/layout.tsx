import { PlatformSidebar } from '@/components/platform/platform-sidebar'
import { PlatformHeader } from '@/components/platform/platform-header'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformSidebar />
      
      <div className="lg:pl-64">
        <PlatformHeader />
        
        <main className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}