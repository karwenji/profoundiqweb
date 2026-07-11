import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // In production, fetch the webhook secret from settings or env
    // const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET
    
    // For now, we'll simulate verification
    // const hash = crypto.createHmac('sha512', webhookSecret).update(body).digest('hex')
    // if (hash !== signature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const event = JSON.parse(body)

    console.log('Paystack Webhook Event:', event.event)

    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference
      const email = data.customer.email
      const amount = data.amount / 100 // Convert from kobo/cents

      console.log(`Payment successful for ${email}: ${reference} - Amount: ${amount}`)

      // Here you would:
      // 1. Verify the transaction with Paystack API to be sure
      // 2. Update the database to enroll the user in the course
      // 3. Send a confirmation email
      
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }
}
