// Social Media Growth Service Configuration
// Inspired by platforms like GetViral.shop

export interface SocialMediaService {
  id: string
  platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'linkedin'
  serviceType: 'followers' | 'likes' | 'views' | 'comments' | 'shares'
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  pricePer1000: number // Price in NGN per 1000 units
  deliveryTime: string // e.g., "1-3 days"
  quality: 'standard' | 'high' | 'premium'
  refill: boolean
  active: boolean
}

export interface SocialMediaOrder {
  id: string
  userId: string
  serviceId: string
  link: string
  quantity: number
  totalCost: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  createdAt: string
  completedAt?: string
}

// Sample services catalog
export const SOCIAL_MEDIA_SERVICES: SocialMediaService[] = [
  // Instagram Services
  {
    id: 'ig-followers-std',
    platform: 'instagram',
    serviceType: 'followers',
    name: 'Instagram Followers - Standard',
    description: 'High-quality Instagram followers with profile pictures and posts',
    minQuantity: 100,
    maxQuantity: 50000,
    pricePer1000: 2500,
    deliveryTime: '1-3 days',
    quality: 'standard',
    refill: true,
    active: true,
  },
  {
    id: 'ig-followers-premium',
    platform: 'instagram',
    serviceType: 'followers',
    name: 'Instagram Followers - Premium',
    description: 'Premium real-looking followers with high engagement rates',
    minQuantity: 50,
    maxQuantity: 20000,
    pricePer1000: 5000,
    deliveryTime: '2-5 days',
    quality: 'premium',
    refill: true,
    active: true,
  },
  {
    id: 'ig-likes-std',
    platform: 'instagram',
    serviceType: 'likes',
    name: 'Instagram Likes - Standard',
    description: 'Instant likes for your Instagram posts',
    minQuantity: 50,
    maxQuantity: 100000,
    pricePer1000: 800,
    deliveryTime: 'Instant - 1 hour',
    quality: 'standard',
    refill: false,
    active: true,
  },
  
  // TikTok Services
  {
    id: 'tt-followers-std',
    platform: 'tiktok',
    serviceType: 'followers',
    name: 'TikTok Followers - Standard',
    description: 'Real-looking TikTok followers to boost your presence',
    minQuantity: 100,
    maxQuantity: 100000,
    pricePer1000: 3000,
    deliveryTime: '1-3 days',
    quality: 'standard',
    refill: true,
    active: true,
  },
  {
    id: 'tt-views-std',
    platform: 'tiktok',
    serviceType: 'views',
    name: 'TikTok Views - Standard',
    description: 'Boost your video views instantly',
    minQuantity: 1000,
    maxQuantity: 10000000,
    pricePer1000: 200,
    deliveryTime: 'Instant - 30 mins',
    quality: 'standard',
    refill: false,
    active: true,
  },
  
  // Facebook Services
  {
    id: 'fb-followers-std',
    platform: 'facebook',
    serviceType: 'followers',
    name: 'Facebook Page Followers',
    description: 'Increase your Facebook page followers organically',
    minQuantity: 100,
    maxQuantity: 50000,
    pricePer1000: 2000,
    deliveryTime: '1-3 days',
    quality: 'standard',
    refill: true,
    active: true,
  },
  
  // YouTube Services
  {
    id: 'yt-subscribers-std',
    platform: 'youtube',
    serviceType: 'followers',
    name: 'YouTube Subscribers',
    description: 'Grow your YouTube channel with real-looking subscribers',
    minQuantity: 50,
    maxQuantity: 10000,
    pricePer1000: 8000,
    deliveryTime: '3-7 days',
    quality: 'high',
    refill: true,
    active: true,
  },
  {
    id: 'yt-views-std',
    platform: 'youtube',
    serviceType: 'views',
    name: 'YouTube Video Views',
    description: 'High-retention views for your YouTube videos',
    minQuantity: 1000,
    maxQuantity: 1000000,
    pricePer1000: 1500,
    deliveryTime: '1-3 days',
    quality: 'high',
    refill: false,
    active: true,
  },
]

// Helper functions
export function getServiceById(id: string): SocialMediaService | undefined {
  return SOCIAL_MEDIA_SERVICES.find(s => s.id === id)
}

export function getServicesByPlatform(platform: string): SocialMediaService[] {
  return SOCIAL_MEDIA_SERVICES.filter(s => s.platform === platform && s.active)
}

export function calculateOrderCost(service: SocialMediaService, quantity: number): number {
  return Math.round((service.pricePer1000 * quantity) / 1000)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}
