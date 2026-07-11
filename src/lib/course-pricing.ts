import { Course } from '@/types'
import { formatCurrency } from './currency'

// Helper to get price for a specific currency
export function getCoursePrice(course: Course, currency: string = 'NGN'): number {
  // If multi-currency pricing is available, use it
  if (course.pricing && course.pricing[currency as keyof typeof course.pricing]) {
    return course.pricing[currency as keyof typeof course.pricing] || course.price
  }
  
  // Fallback to default price
  return course.price
}

// Helper to get original price for a specific currency
export function getCourseOriginalPrice(course: Course, currency: string = 'NGN'): number | undefined {
  // For now, we'll calculate original price based on discount percentage if pricing exists
  if (course.pricing && course.originalPrice) {
    const discountPercentage = 1 - (course.price / course.originalPrice)
    const currentPrice = getCoursePrice(course, currency)
    return Math.round(currentPrice / (1 - discountPercentage))
  }
  
  return course.originalPrice
}

// Helper to format course price with currency
export function formatCoursePrice(course: Course, currency: string = 'NGN'): string {
  const price = getCoursePrice(course, currency)
  return formatCurrency(price, currency)
}
