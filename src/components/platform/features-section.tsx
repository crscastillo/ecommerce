'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Globe, Shield, Users, TrendingUp, Store } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function FeaturesSection() {
  const tFeatures = useTranslations('homepage.features')
  
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            {tFeatures('badge')}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            {tFeatures('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tFeatures('subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="border-2 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('fast.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('fast.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('domain.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('domain.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('security.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('security.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('team.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('team.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-red-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('analytics.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('analytics.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">{tFeatures('themes.title')}</CardTitle>
              <CardDescription className="text-base">
                {tFeatures('themes.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/features">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              {tFeatures('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
