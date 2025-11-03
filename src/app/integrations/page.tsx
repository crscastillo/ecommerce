'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Store, ArrowRight, Zap, Shield, TrendingUp, Mail, MessageSquare, Package, CreditCard, BarChart, Image } from 'lucide-react'
import Link from 'next/link'
import { platformConfig } from '@/lib/config/platform'

const integrations = [
  {
    name: 'Stripe',
    category: 'Payment Processing',
    description: 'Accept payments securely with credit cards, debit cards, and digital wallets',
    icon: CreditCard,
    color: 'blue',
    features: ['Secure checkout', 'Multiple currencies', 'Subscription billing', 'Fraud detection'],
    status: 'active'
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Track visitor behavior, conversion rates, and sales performance',
    icon: BarChart,
    color: 'green',
    features: ['Real-time tracking', 'Custom reports', 'E-commerce tracking', 'Audience insights'],
    status: 'active'
  },
  {
    name: 'Mailchimp',
    category: 'Email Marketing',
    description: 'Build and send email campaigns to engage your customers',
    icon: Mail,
    color: 'yellow',
    features: ['Email automation', 'Customer segments', 'Campaign analytics', 'Template builder'],
    status: 'active'
  },
  {
    name: 'Facebook & Instagram',
    category: 'Social Media',
    description: 'Sell directly on social platforms and sync your inventory',
    icon: MessageSquare,
    color: 'purple',
    features: ['Product catalog sync', 'Social ads', 'Shop integration', 'Message automation'],
    status: 'active'
  },
  {
    name: 'ShipStation',
    category: 'Shipping',
    description: 'Streamline order fulfillment with multi-carrier shipping',
    icon: Package,
    color: 'orange',
    features: ['Label printing', 'Rate comparison', 'Tracking updates', 'Batch shipping'],
    status: 'coming-soon'
  },
  {
    name: 'Zapier',
    category: 'Automation',
    description: 'Connect with 5,000+ apps to automate your workflows',
    icon: Zap,
    color: 'red',
    features: ['Custom workflows', 'Multi-step zaps', 'Trigger actions', 'Data sync'],
    status: 'coming-soon'
  },
  {
    name: 'Cloudinary',
    category: 'Media Management',
    description: 'Optimize and deliver product images at scale',
    icon: Image,
    color: 'indigo',
    features: ['Image optimization', 'CDN delivery', 'Auto-formatting', 'Responsive images'],
    status: 'coming-soon'
  },
  {
    name: 'TrustPilot',
    category: 'Reviews',
    description: 'Collect and display customer reviews to build trust',
    icon: Shield,
    color: 'teal',
    features: ['Review collection', 'Star ratings', 'Review widgets', 'Automated requests'],
    status: 'coming-soon'
  }
]

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' }
  }
  return colors[color] || colors.blue
}

export default function IntegrationsPage() {
  const activeIntegrations = integrations.filter(i => i.status === 'active')
  const comingSoonIntegrations = integrations.filter(i => i.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">{platformConfig.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Integrations</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Connect your favorite tools and services</p>
            </div>
            <Link href="/" className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            POWERFUL INTEGRATIONS
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
            Everything You Need, All in One Place
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Extend your store's capabilities with seamless integrations. Connect payment processors, 
            marketing tools, shipping providers, and more.
          </p>
        </div>

        {/* Active Integrations */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Now</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeIntegrations.map((integration, index) => {
              const Icon = integration.icon
              const colors = getColorClasses(integration.color)
              
              return (
                <Card key={index} className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300">
                  <CardHeader>
                    <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs mb-3">{integration.category}</Badge>
                    <CardDescription className="text-sm">{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" size="sm">
                      Configure <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Coming Soon Integrations */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Coming Soon</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comingSoonIntegrations.map((integration, index) => {
              const Icon = integration.icon
              const colors = getColorClasses(integration.color)
              
              return (
                <Card key={index} className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 opacity-90">
                  <CardHeader>
                    <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Soon</Badge>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs mb-3">{integration.category}</Badge>
                    <CardDescription className="text-sm">{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" size="sm" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Need a Custom Integration?</h3>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our API makes it easy to build custom integrations 
              or request new ones from our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base px-8 py-6">
                View API Documentation
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-base px-8 py-6">
                Request Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
