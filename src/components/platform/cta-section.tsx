'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
      <div className="relative container mx-auto px-4 text-center">
        <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm">
          START TODAY
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          Ready to Start Your Online Store?
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Join thousands of successful entrepreneurs who have already built thriving online businesses with our powerful ecommerce platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-6 shadow-2xl hover:shadow-white/50 transition-all hover:scale-105">
            <Link href="/signup">
              Create Your Store Now →
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-white border-2 border-white/50 hover:bg-white hover:text-blue-600 text-lg px-10 py-6 backdrop-blur-sm hover:scale-105 transition-all">
            Talk to Sales
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center text-sm text-blue-100">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Free 14-day trial
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Cancel anytime
          </span>
        </div>
        <p className="text-sm mt-8 text-blue-100">
          Questions? Our team is here to help • <Link href="/contact" className="underline hover:text-white font-medium">Contact us</Link>
        </p>
      </div>
    </section>
  )
}
