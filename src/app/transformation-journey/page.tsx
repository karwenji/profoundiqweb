'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Logo from '@/components/Logo'
import { ArrowRight, CheckCircle, Lightbulb, TrendingUp, Target, Users, Award, BookOpen, Zap, Shield, Globe } from 'lucide-react'

export default function TransformationJourneyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Transformation Journey
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Unlock your full potential through our proven framework: Discover | Grow | Actualize
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Our Approach
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Profound IQ Consulting, we help individuals, leaders, and organizations unlock their full potential
              through leadership development, professional training, and strategic consulting. Our proven framework guides
              organizations through a structured transformation process that leads to sustainable growth, stronger
              leadership, and measurable impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Lightbulb className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Discover</h3>
                <p className="text-gray-600 text-center">
                  Identify challenges, assess current capabilities, and uncover opportunities for growth through strategic analysis and insight.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <TrendingUp className="h-10 w-10 text-secondary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Grow</h3>
                <p className="text-gray-600 text-center">
                  Develop skills, build capacity, and implement solutions through expert-led training and hands-on practice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-accent hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Target className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Actualize</h3>
                <p className="text-gray-600 text-center">
                  Achieve real results, measure impact, and sustain transformation through continuous improvement and support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Strategic Framework Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Our Strategic Framework
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Profound IQ Consulting is committed to helping organizations achieve long-term
                transformation through leadership development, professional training, and
                strategic consulting services.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We combine insight, innovation, and practical expertise to deliver solutions
                that drive meaningful results.
              </p>
              <ul className="space-y-4">
                {[
                  'Expert leadership development programs',
                  'Strategic organizational consulting',
                  'Professional capacity building',
                  'Sustainable growth strategies',
                  'Transformational learning experiences',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-blue-900/10 rounded-2xl flex items-center justify-center p-8">
                <div className="text-center">
                  <Zap className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-900">Strategic Implementation Framework</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Why Choose Profound IQ Consulting
            </h2>
            <p className="text-lg text-gray-600">
              Organizations that partner with us benefit from comprehensive solutions designed for lasting impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Leadership Development</h3>
                <p className="text-sm text-gray-600">
                  Build strong leaders who drive organizational success
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Professional Training</h3>
                <p className="text-sm text-gray-600">
                  Expert-led courses for career advancement
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Strategic Consulting</h3>
                <p className="text-sm text-gray-600">
                  Data-driven insights for sustainable growth
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6 text-center">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Global Impact</h3>
                <p className="text-sm text-gray-600">
                  Solutions that scale across organizations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of professionals who have unlocked their potential through our proven framework.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse Courses
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
