'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CategoryRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const categorySlug = params?.slug as string

  useEffect(() => {
    // Redirect to products page with category query parameter
    if (categorySlug) {
      router.replace(`/products?category=${categorySlug}`)
    } else {
      router.replace('/products')
    }
  }, [categorySlug, router])

  // Return null since this is just a redirect component
  return null
}