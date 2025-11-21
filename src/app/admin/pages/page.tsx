'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PagesPage() {
  const t = useTranslations('pages')
  const tCommon = useTranslations('common')

  // Mock data for placeholder
  const mockPages = [
    {
      id: '1',
      title: 'About Us',
      slug: 'about-us',
      status: 'published',
      lastModified: '2024-01-15',
      author: 'Admin'
    },
    {
      id: '2', 
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      status: 'published',
      lastModified: '2024-01-10',
      author: 'Admin'
    },
    {
      id: '3',
      title: 'Terms of Service',
      slug: 'terms-of-service', 
      status: 'draft',
      lastModified: '2024-01-08',
      author: 'Admin'
    }
  ]

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('createPage')}
          </Button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">{t('comingSoon')}</h3>
              <p className="text-blue-700">{t('comingSoonDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Pages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('pagesList')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{page.title}</h3>
                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                      {t(`status.${page.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    /{page.slug} • {t('lastModified')}: {page.lastModified} • {t('by')} {page.author}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">{t('noPages')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('noPagesDescription')}</p>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('createFirstPage')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}