'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Zap, Shield, Globe, Users, TrendingUp, Store, 
  ShoppingCart, CreditCard, Package, Settings, 
  BarChart, Mail, Smartphone, Lock, Cloud, 
  RefreshCw, Search, Palette, Code, HeadphonesIcon,
  CheckCircle, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { platformConfig } from '@/lib/config/platform'

const featureCategories = [
  {
    title: 'Store Management',
    description: 'Everything you need to manage your online store efficiently',
    icon: Store,
    color: 'blue',
    features: [
      {
        name: 'Product Management',
        description: 'Create and organize unlimited products with variants, images, and detailed descriptions',
        icon: Package
      },
      {
        name: 'Inventory Tracking',
        description: 'Real-time inventory management with low stock alerts and automated updates',
        icon: BarChart
      },
      {
        name: 'Order Management',
        description: 'Process orders efficiently with automated workflows and status tracking',
        icon: ShoppingCart
      },
      {
        name: 'Category Organization',
        description: 'Organize products into custom categories for easy navigation',
        icon: Settings
      }
    ]
  },
  {
    title: 'Sales & Marketing',
    description: 'Powerful tools to grow your business and increase sales',
    icon: TrendingUp,
    color: 'green',
    features: [
      {
        name: 'SEO Optimization',
        description: 'Built-in SEO tools to help your store rank higher in search results',
        icon: Search
      },
      {
        name: 'Email Marketing',
        description: 'Send automated emails for cart abandonment, promotions, and updates',
        icon: Mail
      },
      {
        name: 'Analytics & Reports',
        description: 'Detailed insights into sales, traffic, and customer behavior',
        icon: BarChart
      },
      {
        name: 'Discount Codes',
        description: 'Create promotional codes and run sales campaigns easily',
        icon: TrendingUp
      }
    ]
  },
  {
    title: 'Payment & Security',
    description: 'Secure payment processing and data protection',
    icon: Shield,
    color: 'purple',
    features: [
      {
        name: 'Secure Payments',
        description: 'Accept credit cards, debit cards, and digital wallets securely',
        icon: CreditCard
      },
      {
        name: 'SSL Encryption',
        description: 'All data encrypted with industry-standard SSL certificates',
        icon: Lock
      },
      {
        name: 'PCI Compliance',
        description: 'Fully PCI-DSS compliant for payment security',
        icon: Shield
      },
      {
        name: 'Fraud Protection',
        description: 'Advanced fraud detection and prevention systems',
        icon: Shield
      }
    ]
  },
  {
    title: 'Design & Customization',
    description: 'Create a unique store that matches your brand',
    icon: Palette,
    color: 'orange',
    features: [
      {
        name: 'Custom Themes',
        description: 'Choose from beautiful templates or create your own design',
        icon: Palette
      },
      {
        name: 'Mobile Responsive',
        description: 'Automatically optimized for all devices and screen sizes',
        icon: Smartphone
      },
      {
        name: 'Custom Domain',
        description: 'Use your own domain name for a professional presence',
        icon: Globe
      },
      {
        name: 'Brand Customization',
        description: 'Full control over colors, fonts, and layout',
        icon: Palette
      }
    ]
  },
  {
    title: 'Technical Features',
    description: 'Advanced capabilities for developers and power users',
    icon: Code,
    color: 'indigo',
    features: [
      {
        name: 'API Access',
        description: 'Full REST API for custom integrations and automation',
        icon: Code
      },
      {
        name: 'Cloud Hosting',
        description: '99.9% uptime with automatic scaling and backups',
        icon: Cloud
      },
      {
        name: 'Multi-tenant',
        description: 'Separate isolated environments for each store',
        icon: Users
      },
      {
        name: 'Auto Updates',
        description: 'Automatic platform updates with zero downtime',
        icon: RefreshCw
      }
    ]
  },
  {
    title: 'Support & Resources',
    description: 'Get help when you need it with comprehensive support',
    icon: HeadphonesIcon,
    color: 'teal',
    features: [
      {
        name: '24/7 Support',
        description: 'Round-the-clock customer support via chat and email',
        icon: HeadphonesIcon
      },
      {
        name: 'Documentation',
        description: 'Extensive guides and tutorials to help you succeed',
        icon: Code
      },
      {
        name: 'Community',
        description: 'Active community forum to connect with other merchants',
        icon: Users
      },
      {
        name: 'Training Resources',
        description: 'Video tutorials and webinars for store optimization',
        icon: TrendingUp
      }
    ]
  }
]

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700 border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700 border-teal-200' }
  }
  return colors[color] || colors.blue
}

export default function FeaturesPage() {
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Features</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Everything you need to succeed online</p>
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
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            COMPREHENSIVE FEATURES
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
            Everything You Need to Build, Launch, and Grow
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides all the tools and features you need to create a successful online store. 
            No technical knowledge required.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          {featureCategories.map((category, index) => {
            const CategoryIcon = category.icon
            const colors = getColorClasses(category.color)
            
            return (
              <div key={index} className="scroll-mt-20">
                <div className="text-center mb-8 sm:mb-12">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <CategoryIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.text}`} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">{category.title}</h3>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon
                    
                    return (
                      <Card key={featureIndex} className={`hover:shadow-xl transition-all duration-300 border-2 hover:${colors.border}`}>
                        <CardHeader>
                          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                            <FeatureIcon className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <CardTitle className="text-lg mb-2">{feature.name}</CardTitle>
                          <CardDescription className="text-sm leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 mb-16">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="py-12 sm:py-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h3>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                  Join thousands of successful merchants who trust us with their online business
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Quick Setup</h4>
                  <p className="text-blue-100">Launch your store in minutes, not days</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Enterprise Security</h4>
                  <p className="text-blue-100">Bank-level encryption and security</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Proven Results</h4>
                  <p className="text-blue-100">Average 40% increase in sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Ready to Get Started?</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already selling online with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
