'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Settings, 
  Flag, 
  CreditCard, 
  Users, 
  Building2,
  LogOut,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  {
    name: 'Dashboard',
    href: '/platform',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'Tenants',
    href: '/platform/tenants',
    icon: Building2,
    current: false
  },
  {
    name: 'Feature Flags',
    href: '/platform/features',
    icon: Flag,
    current: false
  },
  {
    name: 'Billing & Subscriptions',
    href: '/platform/billing',
    icon: CreditCard,
    current: false
  },
  {
    name: 'Settings',
    href: '/platform/settings',
    icon: Settings,
    current: false
  },
]

export function PlatformSidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <Crown className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Platform Admin</span>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                        'group flex gap-x-3 rounded-md p-2 text-sm font-medium'
                      )}
                    >
                      <item.icon 
                        className={cn(
                          pathname === item.href 
                            ? 'text-blue-600' 
                            : 'text-gray-400 group-hover:text-blue-600',
                          'h-5 w-5 shrink-0'
                        )} 
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            
            <li className="mt-auto">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-red-600"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}