import { NextRequest, NextResponse } from 'next/server'
import { getPaymentMethods, updatePaymentMethods, addPaymentMethod, deletePaymentMethod } from '@/lib/settings'

export async function GET() {
  try {
    const methods = getPaymentMethods()
    return NextResponse.json({ success: true, data: methods })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newMethod = addPaymentMethod(body)
    return NextResponse.json({ success: true, data: newMethod }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add payment method' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { methods } = body
    if (!methods || !Array.isArray(methods)) {
      return NextResponse.json(
        { success: false, error: 'Methods array is required' },
        { status: 400 }
      )
    }
    const updatedMethods = updatePaymentMethods(methods)
    return NextResponse.json({ success: true, data: updatedMethods })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update payment methods' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Method ID is required' },
        { status: 400 }
      )
    }
    const deleted = deletePaymentMethod(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, message: 'Payment method deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}
