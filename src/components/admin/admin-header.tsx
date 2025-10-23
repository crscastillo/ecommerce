'use client'

import { useTenant } from '@/lib/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  User, 
  ExternalLink,
  ChevronDown,
  Menu
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { tenant, isOwner, isAdmin } = useTenant()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const visitStore = () => {
    if (tenant?.subdomain) {
      const url = `${window.location.protocol}//${tenant.subdomain}.${window.location.host}`
      window.open(url, '_blank')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="mr-3 lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search - responsive width */}
            <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border-gray-300 pl-10 text-sm"
                  placeholder="Search products, orders..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="ml-4 flex items-center space-x-3 lg:space-x-4">
            {/* Visit Store Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={visitStore}
              className="hidden md:flex"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {tenant?.contact_email || 'Admin'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isOwner ? 'Owner' : isAdmin ? 'Admin' : 'Staff'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={visitStore}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Visit Store</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}