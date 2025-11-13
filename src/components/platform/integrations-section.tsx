'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            INTEGRATIONS
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Connect With Your Favorite Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seamlessly integrate with the tools you already use to run your business more efficiently.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 hover:scale-105">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Payment Processing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Secure payments with industry-leading gateway</p>
            </CardContent>
          </Card>

          <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 hover:scale-105">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Track performance with powerful analytics tools</p>
            </CardContent>
          </Card>

          <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 hover:scale-105">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Social Media</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Connect your social accounts for marketing</p>
            </CardContent>
          </Card>

          <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 hover:scale-105">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Email Marketing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Automated email campaigns and newsletters</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl py-8 px-6 max-w-3xl mx-auto border border-purple-200">
          <p className="text-gray-700 mb-6 text-lg font-medium">Plus many more integrations to power your business</p>
          <Link href="/integrations">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all">
              View All Integrations →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
