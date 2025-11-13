'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function HeroSection() {
  const tHero = useTranslations('homepage.hero')
  
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
      <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
        <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
          {tHero('badge')}
        </Badge>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          {tHero('title')}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
            {tHero('titleHighlight')}
          </span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto text-blue-100">
          {tHero('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 shadow-2xl hover:shadow-blue-500/50 transition-all">
            <Link href="/signup">
              <Zap className="w-5 h-5 mr-2" />
              {tHero('startFreeStore')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white hover:text-blue-600 text-lg px-8 py-6 backdrop-blur-sm">
            {tHero('watchDemo')}
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {tHero('benefits.noCard')}
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {tHero('benefits.trial')}
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {tHero('benefits.cancel')}
          </span>
        </div>
      </div>
    </section>
  )
}
