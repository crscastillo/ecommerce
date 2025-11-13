'use client'

import { Badge } from '@/components/ui/badge'

interface ProductTagsProps {
  tags?: string[]
  t: any
}

export function ProductTags({ tags, t }: ProductTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">{t('product.tags')}:</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>
    </div>
  )
}
