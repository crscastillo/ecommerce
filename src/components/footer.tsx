import Link from "next/link"
import { useTranslations } from "next-intl"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  tenant_id: string
}

interface FooterProps {
  categories?: Category[]
}

export function Footer({ categories = [] }: FooterProps) {
  const t = useTranslations('footer')
  return (
    <footer 
      className="border-t text-white border-gray-700"
      style={{ backgroundColor: 'var(--color-neutral-800)' }}
    >
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{t('storeName')}</h3>
            <p className="text-sm text-gray-300">
              {t('storeDescription')}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t('sections.products')}</h4>
            <ul className="space-y-2 text-sm">
              {categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/products?category=${category.slug}`} 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                      {t('links.allProducts')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t('sections.company')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t('sections.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.returns')}
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-300 hover:text-white transition-colors">
                  {t('links.systemStatus')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-center text-sm text-gray-400">
            {t('copyright', { year: new Date().getFullYear(), storeName: t('storeName') })}
          </p>
        </div>
      </div>
    </footer>
  )
}