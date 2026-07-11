'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { courses } from '@/data/courses'
import { CheckCircle, Lock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import PaystackPayment from '@/components/PaystackPayment'

function CheckoutForm() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  const { items, getTotal, clearCart } = useCart()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // If coming from course detail page with single course
  const singleCourse = courseId ? courses.find(c => c.id === courseId) : null
  const checkoutItems = singleCourse ? [{
    courseId: singleCourse.id,
    title: singleCourse.title,
    price: singleCourse.price,
    image: singleCourse.image,
  }] : items

  const total = singleCourse ? singleCourse.price : (isClient ? getTotal() : 0)

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful with reference:', reference)
    // In production, verify payment with your backend here
  }

  const handlePaymentClose = () => {
    console.log('Payment window closed')
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="pt-6 border-t">
                    <h2 className="text-xl font-semibold mb-4">Secure Payment</h2>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Lock className="h-4 w-4" />
                        <span>Your payment is secured by Paystack</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>

                    {email ? (
                      <PaystackPayment 
                        amount={total} 
                        email={email} 
                        onSuccess={handlePaymentSuccess}
                        onClose={handlePaymentClose}
                      />
                    ) : (
                      <Button disabled className="w-full" size="lg">
                        Enter email to proceed to payment
                      </Button>
                    )}
                  </div>
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Payment</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Secure payment powered by Paystack. You will be redirected to complete your payment.
                    </p>
                    
                    {email ? (
                      <PaystackPayment
                        amount={total}
                        email={email}
                        onSuccess={handlePaymentSuccess}
                        onClose={handlePaymentClose}
                      />
                    ) : (
                      <Button size="lg" className="w-full" disabled>
                        Please enter your email first
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Lock className="h-4 w-4 mr-2" />
                      Secure SSL Encryption
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {checkoutItems.map((item) => (
                    <div key={item.courseId} className="flex gap-3">
                      <div className="relative h-16 w-20 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                        <div className="text-primary font-semibold">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{isClient ? formatPrice(total) : '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{isClient ? formatPrice(total) : '...'}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Instant access after purchase</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Lifetime course access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-12"><div className="container mx-auto px-4">Loading...</div></div>}>
      <CheckoutForm />
    </Suspense>
  )
}