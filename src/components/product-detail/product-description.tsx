'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ProductDescriptionProps {
  description?: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null

  return (
    <div className="mb-12">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
