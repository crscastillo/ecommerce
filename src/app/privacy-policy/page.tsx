'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Store, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { platformConfig } from '@/lib/config/platform'

export default function PrivacyPolicyPage() {
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Privacy Policy</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Last updated: November 3, 2025</p>
            </div>
            <Link href="/" className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            YOUR PRIVACY MATTERS
          </Badge>
          <p className="text-lg text-gray-600">
            We are committed to protecting your personal information and your right to privacy.
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-2">
            <CardContent className="pt-6 pb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and stored securely</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2">
            <CardContent className="pt-6 pb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">No Data Selling</h3>
              <p className="text-sm text-gray-600">We never sell your personal information</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2">
            <CardContent className="pt-6 pb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Your Control</h3>
              <p className="text-sm text-gray-600">Full control over your data at all times</p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Content */}
        <Card className="border-2">
          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to {platformConfig.name}. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you visit our website and use our services. Please read this privacy policy carefully. 
                If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Personal Information</h3>
                  <p className="text-gray-700 mb-2">We may collect personal information that you provide to us, including:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Billing and payment information</li>
                    <li>Account credentials (username and password)</li>
                    <li>Profile information and preferences</li>
                    <li>Communication history with our support team</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Automatically Collected Information</h3>
                  <p className="text-gray-700 mb-2">When you visit our website, we automatically collect certain information:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, click patterns)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (with your permission)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">How We Use Your Information</h2>
              <p className="text-gray-700 mb-3">We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>To provide, operate, and maintain our services</li>
                <li>To process your transactions and manage your orders</li>
                <li>To communicate with you about your account and our services</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website and develop new features</li>
                <li>To detect, prevent, and address technical issues and fraud</li>
                <li>To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-3">We may share your information in the following situations:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or part of our business</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
              </ul>
              <p className="text-gray-700 mt-3 font-semibold">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Lock className="w-6 h-6 text-blue-600" />
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted data storage</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                Your Privacy Rights
              </h2>
              <p className="text-gray-700 mb-3">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Object:</strong> Object to processing of your personal information</li>
              </ul>
              <p className="text-gray-700 mt-3">
                To exercise these rights, please contact us at privacy@{platformConfig.getDomain()}
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-3">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Track your activity for advertising purposes</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your state, province, 
                country, or other governmental jurisdiction where data protection laws may differ. We take appropriate measures 
                to ensure your data receives adequate protection in accordance with this privacy policy.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                privacy policy, unless a longer retention period is required or permitted by law. When we no longer need your 
                information, we will securely delete or anonymize it.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy 
                periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@{platformConfig.getDomain()}</p>
                <p><strong>Address:</strong> 123 Commerce Street, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            By using our services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
