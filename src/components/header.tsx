"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { ShoppingCart, User, Search, Menu } from "lucide-react"
import { useTenant } from "@/lib/contexts/tenant-context"
import { useCart } from "@/lib/contexts/cart-context"
import { useState, useEffect } from "react"
import { getNavigationCategories, type Category } from "@/lib/services/api"
import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations('header')
  const { tenant } = useTenant()
  const { getItemCount } = useCart()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const storeName = tenant?.name || t('defaultStoreName')
  const cartItemCount = getItemCount()

  useEffect(() => {
    if (!tenant?.id) return

    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const result = await getNavigationCategories(tenant.id, 3)
        
        if (result.data) {
          setCategories(result.data)
        } else {
          console.error('Error loading categories:', result.error)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [tenant?.id])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">
              {storeName}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t('navigation.products')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/products"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {t('navigation.featuredProducts')}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {t('navigation.featuredProductsDescription')}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {loadingCategories ? (
                        <li>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none">
                            <div className="text-sm font-medium leading-none text-muted-foreground">
                              {t('navigation.loadingCategories')}
                            </div>
                          </div>
                        </li>
                      ) : categories.length > 0 ? (
                        <>
                          {categories.map((category) => (
                            <li key={category.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/products/category/${category.slug}`}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">{category.name}</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {category.description || t('navigation.browseCategoryCollection', { category: category.name.toLowerCase() })}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/products"
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border-t border-border mt-2 pt-3"
                              >
                                <div className="text-sm font-medium leading-none">{t('navigation.viewAllProducts')}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {t('navigation.browseCompleteCatalog')}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </>
                      ) : (
                        <li>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none">
                            <div className="text-sm font-medium leading-none text-muted-foreground">
                              {t('navigation.noCategoriesAvailable')}
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      {t('navigation.about')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden sm:block">
            <Button variant="outline" className="relative h-9 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline-flex">{t('search.searchProducts')}</span>
              <span className="lg:hidden">{t('search.search')}</span>
            </Button>
          </div>
          
          {/* Mobile Search Button */}
          <Button variant="ghost" size="sm" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Cart and User Actions */}
          <div className="flex items-center space-x-2">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}