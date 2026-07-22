import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingRegisterButton from '@/components/FloatingRegisterButton'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ToastProvider } from '@/components/dashboard/Toast'

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
      <body className="font-sans antialiased">
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <FloatingRegisterButton />
            </ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}