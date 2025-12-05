'use client'

import { Card, CardContent } from '@/components/ui/card'

interface CartLoadingSkeletonProps {
  itemCount?: number
}

export function CartLoadingSkeleton({ itemCount = 3 }: CartLoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: itemCount }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-muted rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}