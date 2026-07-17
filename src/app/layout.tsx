import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingRegisterButton from '@/components/FloatingRegisterButton'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Profound IQ Consulting - Professional Development Courses',
  description: 'Transform your career with world-class professional development courses and training programs. Learn from industry experts and advance your skills.',
  keywords: 'professional development, online courses, training, leadership, digital marketing, project management',
  icons: {
    icon: '/favicon.svg',
  },
  metadataBase: new URL('https://profoundiqconsulting.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SettingsProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <FloatingRegisterButton />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}