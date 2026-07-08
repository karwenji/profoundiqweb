'use client'

import { useState } from 'react'
import { usePaystackPayment } from 'react-paystack'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { useRouter } from 'next/navigation'

interface PaystackPaymentProps {
  amount: number
  email: string
  onSuccess: (reference: string) => void
  onClose: () => void
}

export default function PaystackPayment({ amount, email, onSuccess, onClose }: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { clearCart } = useCart()
  const router = useRouter()

  const config = {
    reference: new Date().getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack uses kobo (multiply by 100 for Naira)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  }

  const initializePayment = usePaystackPayment(config)

  const handlePayment = () => {
    setIsLoading(true)
    initializePayment(
      {
        onSuccess: (transaction) => {
          setIsLoading(false)
          onSuccess(transaction.reference)
          clearCart()
          alert('Payment successful! You now have access to your courses.')
          router.push('/dashboard')
        },
        onClose: () => {
          setIsLoading(false)
          onClose()
        },
      },
      true
    )
  }

  return (
    <Button 
      onClick={handlePayment} 
      size="lg" 
      className="w-full"
      disabled={isLoading || !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
    >
      {isLoading ? 'Processing...' : 'Pay with Paystack'}
    </Button>
  )
}
