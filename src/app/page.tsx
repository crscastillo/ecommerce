'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Store, Zap, Shield, Globe, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/lib/contexts/tenant-context";
import { createClient } from "@/lib/supabase/client";
import { redirectToUserTenantAdmin } from "@/lib/utils/tenant-redirects";
import StoreHomepage from "@/components/store/store-homepage";
import { platformConfig } from "@/lib/config/platform";

export default function HomePage() {
  const { tenant, isLoading } = useTenant();

  // Show loading state while determining context
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have a tenant, show the store homepage
  if (tenant) {
    return <StoreHomepage tenant={tenant} />;
  }

  // Otherwise, show the platform homepage
  return <PlatformHomepage />;
}

function PlatformHomepage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // Function to redirect to user's tenant admin
  const handleGoToAdmin = async () => {
    if (!user) return;
    
    await redirectToUserTenantAdmin(user, {
      fallbackPath: '/signup',
      onError: (error) => {
        console.error('Admin redirect failed:', error)
        // Fallback to signup if user has no tenants
        window.location.href = '/signup'
      }
    })
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                {platformConfig.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button variant="default" onClick={handleGoToAdmin}>
                  Go to admin
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            🚀 Trusted by 10,000+ businesses worldwide
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Build Your Dream Store
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
              In Minutes, Not Months
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto text-blue-100">
            Launch a professional ecommerce store with everything you need to sell online. 
            Custom domains, secure payments, and powerful features—all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 shadow-2xl hover:shadow-blue-500/50 transition-all">
              <Link href="/signup">
                <Zap className="w-5 h-5 mr-2" />
                Start Your Free Store
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white hover:text-blue-600 text-lg px-8 py-6 backdrop-blur-sm">
              Watch Demo Video
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No credit card required
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              14-day free trial
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              FEATURES
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Everything You Need to Sell Online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, manage, and grow your online business with ease.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="border-2 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Lightning Fast Setup</CardTitle>
                <CardDescription className="text-base">
                  Get your store online in under 5 minutes. Choose your subdomain and start selling immediately with our intuitive setup wizard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Custom Domains</CardTitle>
                <CardDescription className="text-base">
                  Use your own domain or get a free subdomain. SSL certificates included automatically for secure shopping experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                <CardDescription className="text-base">
                  Built with enterprise-grade security. Your data and your customers' information are always protected with industry standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
                <CardDescription className="text-base">
                  Invite team members with customizable permission levels. Work together seamlessly on your store operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Insights</CardTitle>
                <CardDescription className="text-base">
                  Track sales, monitor performance, and understand your customers with comprehensive analytics and detailed reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Beautiful Themes</CardTitle>
                <CardDescription className="text-base">
                  Professional, mobile-responsive themes that make your products look stunning on any device, no design skills needed.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
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

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Online Store?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            Join thousands of successful entrepreneurs who have already built thriving online businesses with our powerful ecommerce platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-6 shadow-2xl hover:shadow-white/50 transition-all">
              <Link href="/signup">
                Create Your Store Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white hover:text-blue-600 text-lg px-10 py-6 backdrop-blur-sm">
              Talk to Sales
            </Button>
          </div>
          <p className="text-sm mt-6 text-blue-100">
            Questions? Our team is here to help • <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Store className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">{platformConfig.name}</span>
              </div>
              <p className="text-gray-400 text-sm">
                The easiest way to create and manage your online store.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 {platformConfig.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
