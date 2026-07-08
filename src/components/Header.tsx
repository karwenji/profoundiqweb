'use client'

import Link from 'next/link'
import { useCart } from '@/store/cart'
import { Button } from './ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

export default function Header() {
  const { items } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/courses" className="text-sm font-medium transition-colors hover:text-primary">
              Courses
            </Link>
            <Link href="/#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
            <Link href="/#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-xs font-bold flex items-center justify-center text-secondary-foreground">
                    {items.length}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="hidden md:inline-flex">
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/courses" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Courses
              </Link>
              <Link href="/#testimonials" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </Link>
              <Link href="/auth/login" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/auth/register" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}