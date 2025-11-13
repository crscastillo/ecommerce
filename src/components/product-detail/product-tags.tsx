'use client'

import { Badge } from '@/components/ui/badge'

interface ProductTagsProps {
  tags?: string[]
}

export function ProductTags({ tags }: ProductTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">Tags:</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>
    </div>
  )
}
