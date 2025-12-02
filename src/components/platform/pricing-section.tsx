'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export function PricingSection() {
  const tPricing = useTranslations('homepage.pricing')
  
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
            {tPricing('badge')}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            {tPricing('title')}
          </h2>
          <p className="text-xl text-gray-600">{tPricing('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">{tPricing('free.name')}</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">{tPricing('free.price')}</span>
                <span className="text-xl font-normal text-gray-600">{tPricing('free.priceUnit')}</span>
              </div>
              <CardDescription className="text-base">{tPricing('free.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('free.features.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('free.features.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('free.features.feature3')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('free.features.feature4')}</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base" variant="outline" asChild>
                <Link href="/signup">{tPricing('free.cta')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 shadow-2xl relative scale-105 hover:scale-110 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1 text-sm shadow-lg">
                {tPricing('business.badge')}
              </Badge>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2">{tPricing('business.name')}</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">{tPricing('business.price')}</span>
                <span className="text-xl font-normal text-gray-600">{tPricing('business.priceUnit')}</span>
              </div>
              <CardDescription className="text-base">{tPricing('business.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('business.features.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('business.features.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('business.features.feature3')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('business.features.feature4')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('business.features.feature5')}</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <Link href="/signup">{tPricing('business.cta')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">{tPricing('pro.name')}</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">{tPricing('pro.price')}</span>
                <span className="text-xl font-normal text-gray-600">{tPricing('pro.priceUnit')}</span>
              </div>
              <CardDescription className="text-base">{tPricing('pro.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('pro.features.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('pro.features.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('pro.features.feature3')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('pro.features.feature4')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tPricing('pro.features.feature5')}</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base" variant="outline" asChild>
                <Link href="/signup">{tPricing('pro.cta')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
