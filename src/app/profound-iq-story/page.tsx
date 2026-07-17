'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Lightbulb, TrendingUp, Target, Users, Award, BookOpen, Zap, Heart, Globe, CheckCircle, Star } from 'lucide-react'

export default function ProfoundIQStoryPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Profound IQ Story
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Empowering individuals and organizations to unlock their full potential through transformational learning and strategic growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Welcome to Profound IQ Consulting
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Profound IQ Consulting is a professional consulting and training firm dedicated to helping individuals, leaders, and organizations unlock their full potential. We specialize in transformational learning, leadership development, and strategic growth programs that empower people to move from insight to impact.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Profound IQ Consulting, we believe that true growth begins with discovery, is nurtured through development, and is realized through purposeful action. Our approach is designed to equip people with the knowledge, skills, and mindset necessary to thrive in a rapidly changing world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Customer Satisfaction</h3>
                <p className="text-4xl font-bold text-primary mb-2">98%</p>
                <p className="text-sm text-gray-600">Satisfied clients worldwide</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <Award className="h-10 w-10 text-secondary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Successful Projects</h3>
                <p className="text-4xl font-bold text-secondary mb-2">500+</p>
                <p className="text-sm text-gray-600">Completed transformations</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-accent hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Star className="h-10 w-10 text-accent" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Quality Work</h3>
                <p className="text-4xl font-bold text-accent mb-2">100%</p>
                <p className="text-sm text-gray-600">Commitment to excellence</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              What We Really Do?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Profound IQ Consulting offers services designed to strengthen individuals and organizations through practical, engaging, and transformational programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Users, title: 'Leadership Development', desc: 'Build strong leaders who drive organizational success' },
              { icon: BookOpen, title: 'Professional Training', desc: 'Expert-led courses for career advancement and capacity building' },
              { icon: Target, title: 'Organizational Development', desc: 'Strategic consulting for sustainable growth' },
              { icon: Zap, title: 'Strategic Planning', desc: 'Facilitation and guidance for effective decision-making' },
              { icon: TrendingUp, title: 'Personal Growth Programs', desc: 'Unlock individual potential through structured learning' },
              { icon: Heart, title: 'Mentorship & Coaching', desc: 'One-on-one guidance for professional development' },
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <item.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Our Philosophy
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-8 pb-8">
                <Lightbulb className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Discover</h3>
                <p className="text-gray-600 leading-relaxed">
                  We help individuals and organizations discover their strengths, opportunities, and purpose through structured learning, strategic thinking, and guided reflection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="pt-8 pb-8">
                <TrendingUp className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Grow</h3>
                <p className="text-gray-600 leading-relaxed">
                  Through practical training, mentorship, and coaching, we support continuous development in leadership, personal growth, and organizational effectiveness.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="pt-8 pb-8">
                <Target className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold mb-4">Actualize</h3>
                <p className="text-gray-600 leading-relaxed">
                  We focus on helping people translate knowledge into real impact by equipping them to implement ideas, lead effectively, and create lasting transformation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-900/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Our Mission & Values
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-primary flex items-center">
                    <Zap className="h-6 w-6 mr-2" />
                    Our Mission
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Empower individuals and organizations with transformational knowledge, practical skills, and strategic insights that lead to sustainable growth and meaningful impact.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-secondary flex items-center">
                    <Globe className="h-6 w-6 mr-2" />
                    Our Vision
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    A trusted partner in strategic professional development globally.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-accent flex items-center">
                    <Heart className="h-6 w-6 mr-2" />
                    Our Commitment
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    At Profound IQ Consulting, we are committed to excellence, integrity, and impact. We partner with individuals, institutions, and organizations to cultivate leadership, foster innovation, and build sustainable growth pathways.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-white border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Core Values</h3>
                <ul className="space-y-3">
                  {[
                    'Excellence in everything we do',
                    'Integrity and transparency',
                    'Innovation and continuous improvement',
                    'Collaboration and partnership',
                    'Impact-driven results',
                    'Respect and inclusivity',
                  ].map((value, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Us CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Us
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            You are part of our success story. Start your transformation journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Register Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
