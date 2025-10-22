import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Store Not Found</CardTitle>
          <CardDescription>
            The store you're looking for doesn't exist or has been deactivated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This could happen if:
          </p>
          <ul className="text-sm text-gray-600 text-left list-disc pl-4 space-y-1">
            <li>The store URL was typed incorrectly</li>
            <li>The store has been temporarily disabled</li>
            <li>The store has been permanently closed</li>
          </ul>
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/signup">
                Create Your Own Store
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}