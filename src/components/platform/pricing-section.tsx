'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
            PRICING
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">Choose the perfect plan for your business needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Starter</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">Free</span>
              </div>
              <CardDescription className="text-base">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Up to 10 products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Free subdomain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic themes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base" variant="outline" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 shadow-2xl relative scale-105 hover:scale-110 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1 text-sm shadow-lg">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2">Professional</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$29</span>
                <span className="text-xl font-normal text-gray-600">/mo</span>
              </div>
              <CardDescription className="text-base">For growing businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Custom domain</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Premium themes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <Link href="/signup">Start 14-Day Trial</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-xl font-normal text-gray-600">/mo</span>
              </div>
              <CardDescription className="text-base">For large-scale operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Professional</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Team management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">API access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">24/7 phone support</span>
                </li>
              </ul>
              <Button className="w-full h-12 text-base" variant="outline" asChild>
                <Link href="/signup">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
