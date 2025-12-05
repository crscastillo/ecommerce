'use client'

import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export function EmptyCart() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href="/products">
            <Button size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
