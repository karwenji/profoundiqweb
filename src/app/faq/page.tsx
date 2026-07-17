'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqCategories = [
  {
    title: 'General Questions',
    items: [
      {
        question: 'What is Profound IQ Consulting?',
        answer: 'Profound IQ Consulting is a professional consulting and training firm dedicated to helping individuals, leaders, and organizations unlock their full potential through transformational learning, leadership development, and strategic growth programs.',
      },
      {
        question: 'Who can benefit from your services?',
        answer: 'Our services are designed for professionals at all levels, organizational leaders, teams seeking development, students pursuing career advancement, and organizations looking to enhance their capabilities through strategic consulting and training.',
      },
      {
        question: 'How do I get started?',
        answer: 'You can start by creating a free account on our platform. Browse our course catalog, select the programs that align with your goals, and enroll. For consulting services, contact us directly to schedule an initial consultation.',
      },
    ],
  },
  {
    title: 'Courses & Learning',
    items: [
      {
        question: 'Are courses self-paced or scheduled?',
        answer: 'Most of our online courses are self-paced, allowing you to learn at your own convenience. However, some specialized programs and workshops may have scheduled live sessions. Check the course details for specific format information.',
      },
      {
        question: 'Do I receive a certificate upon completion?',
        answer: 'Yes! Upon successful completion of any course or program, you will receive a digital certificate that you can download, share on LinkedIn, or add to your professional portfolio.',
      },
      {
        question: 'Can I access course materials after completion?',
        answer: 'Yes, you retain lifetime access to all course materials for courses you have purchased. This includes video lectures, downloadable resources, and any future updates to the course content.',
      },
      {
        question: 'What if I need help during a course?',
        answer: 'Each course has dedicated support channels including discussion forums, instructor Q&A sessions, and email support. Our team typically responds within 24 hours during business days.',
      },
    ],
  },
  {
    title: 'Payments & Billing',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For corporate clients, we also offer invoice-based billing and purchase order processing.',
      },
      {
        question: 'Is there a refund policy?',
        answer: 'Yes, we offer a 30-day money-back guarantee for most courses. If you are not satisfied with your purchase, contact our support team within 30 days for a full refund. Some restrictions may apply to downloaded content or completed courses.',
      },
      {
        question: 'Do you offer discounts or scholarships?',
        answer: 'We periodically offer promotional discounts and have scholarship programs for eligible candidates. Subscribe to our newsletter or follow us on social media to stay updated on current offers.',
      },
      {
        question: 'Can my employer pay for my courses?',
        answer: 'Absolutely! Many of our learners have their courses sponsored by employers. We provide invoices and documentation suitable for corporate reimbursement programs. Contact us for bulk pricing or corporate accounts.',
      },
    ],
  },
  {
    title: 'Technical Support',
    items: [
      {
        question: 'What are the system requirements?',
        answer: 'Our platform works on any modern web browser (Chrome, Firefox, Safari, Edge) with a stable internet connection. For optimal video streaming, we recommend at least 5 Mbps bandwidth. Mobile apps are available for iOS and Android devices.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click the "Forgot Password" link on the login page. Enter your registered email address, and we will send you a secure link to reset your password. The link expires after 24 hours for security.',
      },
      {
        question: 'Videos are not playing properly. What should I do?',
        answer: 'Try clearing your browser cache, disabling ad blockers, or switching to a different browser. Ensure your internet connection is stable. If issues persist, contact our technical support team with details about your browser and device.',
      },
      {
        question: 'Can I download videos for offline viewing?',
        answer: 'Some courses offer downloadable resources and supplementary materials. Video content is typically streamed to protect intellectual property. Check individual course pages for available downloads.',
      },
    ],
  },
  {
    title: 'Consulting Services',
    items: [
      {
        question: 'What types of consulting do you offer?',
        answer: 'We provide leadership development consulting, organizational effectiveness assessments, strategic planning facilitation, team building workshops, change management support, and executive coaching tailored to your organization\'s needs.',
      },
      {
        question: 'How long does a typical consulting engagement last?',
        answer: 'Engagement duration varies based on scope and objectives. Short-term projects may take 4-8 weeks, while comprehensive transformation initiatives can span 6-12 months. We work with you to define clear timelines and milestones.',
      },
      {
        question: 'Do you work with organizations outside Kenya?',
        answer: 'Yes, we serve clients globally. While headquartered in Kenya, we have experience working with organizations across Africa, Europe, North America, and Asia through both virtual and on-site engagements.',
      },
    ],
  },
]

function FAQAccordion({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full py-4 px-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          {item.answer}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions about our courses, services, and platform.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-lg text-gray-600">No questions found matching "{searchQuery}"</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category, categoryIndex) => (
                  <Card key={categoryIndex}>
                    <CardContent className="pt-6 pb-2">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                          {categoryIndex + 1}
                        </span>
                        {category.title}
                      </h2>
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item, itemIndex) => {
                          const key = `${categoryIndex}-${itemIndex}`
                          return (
                            <FAQAccordion
                              key={itemIndex}
                              item={item}
                              isOpen={!!openItems[key]}
                              onClick={() => toggleItem(key)}
                            />
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Still Need Help Section */}
            <Card className="mt-12 bg-gradient-to-br from-primary/5 to-blue-900/5 border-primary/20">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Still Have Questions?</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help. Reach out to us and we'll get back to you within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="w-full sm:w-auto">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

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
