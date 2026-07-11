'use client'

import { useState, useEffect } from 'react'
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
  const [isClient, setIsClient] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState({
    publicKey: '',
    currency: 'NGN',
    prefix: 'PQ'
  })
  const { clearCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    // Fetch payment config from settings API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.payments) {
          const { paystackPublicKey, currency, transactionPrefix } = data.data.payments
          setPaymentConfig({
            publicKey: paystackPublicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            currency: currency || 'NGN',
            prefix: transactionPrefix || 'PQ'
          })
        } else {
          setPaymentConfig({
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            currency: 'NGN',
            prefix: 'PQ'
          })
        }
      })
      .catch(() => {
        setPaymentConfig({
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          currency: 'NGN',
          prefix: 'PQ'
        })
      })
  }, [])

  const handlePayment = () => {
    if (!isClient) return
    
    if (!paymentConfig.publicKey) {
      alert('Payment configuration is missing. Please contact support.')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      alert('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    
    // Check if script is already loaded
    if ((window as any).PaystackPop) {
      initializePaystack((window as any).PaystackPop)
    } else {
      // Load Paystack script dynamically
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
      if (existingScript) {
        // Wait for existing script to load
        const checkInterval = setInterval(() => {
          if ((window as any).PaystackPop) {
            clearInterval(checkInterval)
            initializePaystack((window as any).PaystackPop)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkInterval)
          if (!(window as any).PaystackPop) {
            setIsLoading(false)
            alert('Payment gateway failed to load. Please try again.')
          }
        }, 10000)
      } else {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
          if ((window as any).PaystackPop) {
            initializePaystack((window as any).PaystackPop)
          } else {
            setIsLoading(false)
            alert('Failed to load payment gateway.')
          }
        }

        script.onerror = () => {
          setIsLoading(false)
          alert('Failed to connect to payment gateway. Please check your internet connection.')
        }
      }
    }
  }

  const initializePaystack = (PaystackPop: any) => {
    // Define handlers as standard functions to ensure compatibility
    const handleSuccess = (response: any) => {
      // Handle async logic inside
      ;(async () => {
        // Verify status is success
        if (response.status === 'success') {
          try {
            // Verify with backend
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                email: email,
                amount: amount,
                courseId: 'multiple',
              }),
            })
            
            const verifyData = await verifyRes.json()
            
            if (verifyData.success) {
              setIsLoading(false)
              onSuccess(response.reference)
              clearCart()
              alert('Payment successful! You now have access to your courses.')
              router.push('/dashboard')
            } else {
              setIsLoading(false)
              alert('Payment verification failed: ' + verifyData.message)
            }
          } catch (error) {
            setIsLoading(false)
            console.error('Verification error:', error)
            alert('An error occurred while verifying your payment. Please contact support.')
          }
        } else {
          setIsLoading(false)
          alert('Payment was not completed. Status: ' + response.status)
        }
      })()
    }

    const handleClose = () => {
      setIsLoading(false)
      alert('Payment window closed. If you experienced an error, please try again.')
      onClose()
    }

    // Determine multiplier based on currency (Paystack uses subunits)
    // NGN, GHS, ZAR use 100 (kobo/pesewas/cents), USD uses 100 (cents)
    const multiplier = 100
    const paystackAmount = Math.round(amount * multiplier)

    const config = {
      reference: `${paymentConfig.prefix}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`,
      email: email,
      amount: paystackAmount,
      currency: paymentConfig.currency,
      publicKey: paymentConfig.publicKey,
      metadata: {
        custom_fields: [
          { display_name: "Platform", variable_name: "platform", value: "Profound IQ" }
        ]
      },
      callback: handleSuccess,
      onClose: handleClose,
    }

    try {
      const handler = PaystackPop.setup(config)
      handler.openIframe()
    } catch (error: any) {
      console.error('Paystack initialization error:', error)
      setIsLoading(false)
      alert(`Payment initialization failed: ${error.message || 'Please check your internet connection and try again.'}`)
    }
  }

  if (!isClient) {
    return <Button disabled size="lg" className="w-full">Loading Payment...</Button>
  }

  return (
    <Button 
      onClick={handlePayment} 
      size="lg" 
      className="w-full"
      disabled={isLoading || !paymentConfig.publicKey}
    >
      {isLoading ? 'Processing...' : 'Pay with Paystack'}
    </Button>
  )
}
