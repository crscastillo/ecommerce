'use client'

import { Store } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { platformConfig } from "@/lib/config/platform"

export function PlatformFooter() {
  const tFooter = useTranslations('homepage.footer')
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Store className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">{platformConfig.name}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {tFooter('description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">{tFooter('product')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#features" className="hover:text-white transition-colors">{tFooter('links.features')}</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">{tFooter('links.pricing')}</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">{tFooter('links.integrations')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">{tFooter('support')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">{tFooter('links.helpCenter')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{tFooter('links.contactUs')}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{tFooter('links.documentation')}</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">{tFooter('links.systemStatus')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">{tFooter('company')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">{tFooter('links.aboutUs')}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">{tFooter('links.privacyPolicy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            {tFooter('copyright', { platformName: platformConfig.name })}
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">{tFooter('links.termsOfService')}</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">{tFooter('links.privacy')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{tFooter('links.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
