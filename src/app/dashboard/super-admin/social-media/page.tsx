'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { SOCIAL_MEDIA_SERVICES, calculateOrderCost, formatCurrency } from '@/lib/social-media-service'
import { Instagram, Facebook, Youtube, Twitter, Linkedin, Video, Heart, MessageCircle, Share2, Users, Loader2, CheckCircle } from 'lucide-react'

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Video,
}

function SuperAdminSocialMediaPage() {
  const { user } = useAuth()
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedService, setSelectedService] = useState('')
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const filteredServices = selectedPlatform === 'all' 
    ? SOCIAL_MEDIA_SERVICES.filter(s => s.active)
    : SOCIAL_MEDIA_SERVICES.filter(s => s.platform === selectedPlatform && s.active)

  const currentService = SOCIAL_MEDIA_SERVICES.find(s => s.id === selectedService)
  const estimatedCost = currentService && quantity 
    ? calculateOrderCost(currentService, parseInt(quantity)) 
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentService || !link || !quantity) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setLink('')
      setQuantity('')
      setSelectedService('')
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Media Growth Services</h1>
          <p className="text-gray-600">Boost your social media presence with our premium growth services.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Place New Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Link</Label>
                  <Input 
                    placeholder="https://..." 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    required
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    placeholder="Min: " 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    min={currentService?.minQuantity}
                    max={currentService?.maxQuantity}
                    required
                  />
                  {currentService && (
                    <p className="text-xs text-gray-500 mt-1">
                      Min: {currentService.minQuantity} - Max: {currentService.maxQuantity}
                    </p>
                  )}
                </div>

                {estimatedCost > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(estimatedCost)}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !currentService || !link || !quantity}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Order Placed!
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Services List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Available Services</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredServices.map(service => {
                const Icon = PLATFORM_ICONS[service.platform]
                return (
                  <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedService(service.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{service.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-primary">{formatCurrency(service.pricePer1000)} / 1k</span>
                            <span className="text-gray-500">{service.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminSocialMediaPageWrapper() {
  return (
    <ProtectedRoute>
      <SuperAdminSocialMediaPage />
    </ProtectedRoute>
  )
}
