'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardContent className="pt-8 pb-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Welcome to Profound IQ Consulting. These Terms of Service govern your use of our website,
                  courses, and services. By accessing or using our platform, you agree to be bound by these terms.
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: July 2026
                </p>
              </CardContent>
            </Card>

            {/* Section 1: Acceptance */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using this website and our services, you accept and agree to be bound by the terms
                and provisions of this agreement. If you do not agree to abide by these terms, please do not use
                this service. We reserve the right to modify these terms at any time without prior notice.
              </p>
            </div>

            {/* Section 2: Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Description of Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Profound IQ Consulting provides online educational courses, professional training, leadership
                development programs, and consulting services. Our platform offers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Online courses and educational content</li>
                <li>Professional certification programs</li>
                <li>Leadership development training</li>
                <li>Consulting and advisory services</li>
                <li>Mentorship and coaching sessions</li>
                <li>Community forums and networking opportunities</li>
              </ul>
            </div>

            {/* Section 3: User Accounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                User Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current information.
                You are responsible for safeguarding your password and for all activities that occur under your account.
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>You must notify us immediately of any unauthorized use of your account</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>We reserve the right to suspend or terminate accounts that violate these terms</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  <span>You may not share your account credentials with others</span>
                </li>
              </ul>
            </div>

            {/* Section 4: Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Intellectual Property Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on this platform, including but not limited to text, graphics, logos, images, videos,
                course materials, and software, is the property of Profound IQ Consulting or its content suppliers
                and is protected by international copyright laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit
                any content without our express written permission. Course materials are licensed for personal,
                non-commercial use only.
              </p>
            </div>

            {/* Section 5: Payments */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
                Payments and Refunds
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All payments are processed securely through our payment partners. By purchasing our services, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Pay all fees associated with your selected courses or services</li>
                <li>Provide accurate billing information</li>
                <li>Accept that prices are subject to change without notice</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Refund requests must be submitted within 30 days of purchase. Refunds are processed on a case-by-case
                basis and may be subject to administrative fees. Digital content that has been accessed or downloaded
                may not be eligible for refund.
              </p>
            </div>

            {/* Section 6: User Conduct */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
                User Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use our platform for any unlawful purpose or in any way that could damage, disable,
                or impair our services. Prohibited activities include:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Violating any applicable laws or regulations</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Infringing on intellectual property rights</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Harassing, abusing, or harming other users</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Attempting to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Distributing malware or harmful code</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  <span>Sharing course materials without authorization</span>
                </li>
              </ul>
            </div>

            {/* Section 7: Disclaimer */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
                Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are provided "as is" and "as available" without warranties of any kind, either express
                or implied. We do not warrant that our services will be uninterrupted, error-free, or free of
                harmful components. We make no representations about the accuracy, reliability, or completeness
                of any content on our platform.
              </p>
            </div>

            {/* Section 8: Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">8</span>
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Profound IQ Consulting, its directors, employees, partners, agents, suppliers,
                or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your access to or use of our services.
              </p>
            </div>

            {/* Section 9: Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">9</span>
                Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to our services immediately, without prior
                notice or liability, for any reason whatsoever, including without limitation if you breach these
                Terms. Upon termination, your right to use our services will immediately cease.
              </p>
            </div>

            {/* Section 10: Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">10</span>
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of Kenya, without regard
                to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the
                courts of Kenya.
              </p>
            </div>

            {/* Section 11: Changes */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">11</span>
                Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material,
                we will try to provide at least 30 days' notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole discretion.
              </p>
            </div>

            {/* Section 12: Contact */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">12</span>
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> info@profoundiqconsulting.com</p>
                    <p><strong>Phone:</strong> +254 727 374 055</p>
                    <p><strong>Address:</strong> Nairobi, Kenya</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
