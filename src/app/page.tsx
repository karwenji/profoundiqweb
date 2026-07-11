'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CourseCard from '@/components/CourseCard'
import Logo from '@/components/Logo'
import { courses, testimonials } from '@/data/courses'
import { users } from '@/lib/users'
import { Star, CheckCircle, ArrowRight, Users, Award, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    averageRating: 0,
  })

  useEffect(() => {
    // Calculate real stats from backend data
    const totalStudents = users.filter(u => u.role === 'student').length
    const totalInstructors = users.filter(u => u.role === 'instructor').length
    const totalCourses = courses.length
    const averageRating = courses.length > 0 
      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
      : '0.0'

    setStats({
      totalStudents,
      totalInstructors,
      totalCourses,
      averageRating: parseFloat(averageRating),
    })
  }, [])

  const featuredCourses = courses.slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Unlock Your Professional Potential
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Master in-demand skills with expert-led courses designed for career advancement and professional growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Browse Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  <span>Certificate Included</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                alt="Professional learning"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.totalStudents.toLocaleString()}+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.totalInstructors}+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.totalCourses}+</div>
              <div className="text-gray-600">Professional Courses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.averageRating}/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular courses designed to help you advance your career and develop new skills.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg" variant="outline">
                View All Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Profound IQ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality education and support for your professional development journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Instructors</h3>
                <p className="text-gray-600">
                  Learn from industry professionals with years of real-world experience and proven track records.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Practical Curriculum</h3>
                <p className="text-gray-600">
                  Our courses focus on practical, applicable skills that you can use immediately in your career.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Support</h3>
                <p className="text-gray-600">
                  Join a vibrant community of learners and get support from peers and instructors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from professionals who have transformed their careers with our courses.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full mr-4"
                      style={{ width: '50px', height: '50px' }}
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Invest in your future with affordable pricing and flexible payment options.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-2">Single Course</h3>
                <div className="text-4xl font-bold text-primary mb-4">$199<span className="text-lg text-gray-600">/course</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Lifetime access</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Certificate included</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Downloadable resources</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Community access</li>
                </ul>
                <Link href="/courses" className="block">
                  <Button className="w-full">Choose Plan</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-2">Professional Bundle</h3>
                <div className="text-4xl font-bold text-primary mb-4">$499<span className="text-lg text-gray-600">/bundle</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 5 courses included</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Priority support</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Exclusive webinars</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Career coaching session</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Save 40%</li>
                </ul>
                <Link href="/courses" className="block">
                  <Button className="w-full" variant="secondary">Choose Plan</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-primary mb-4">Custom</div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Unlimited courses</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Team management</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Custom training paths</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Dedicated account manager</li>
                </ul>
                <Link href="/contact" className="block">
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of professionals who have advanced their careers with Profound IQ Consulting.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}