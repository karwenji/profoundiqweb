'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from '@/components/dashboard/EmptyState'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  title?: string
  message?: string
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard section error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <ErrorState
          title={this.props.title || 'Section failed to load'}
          message={this.props.message || 'Something went wrong while loading this section.'}
          onRetry={this.props.onRetry ? this.handleRetry : undefined}
        />
      )
    }

    return this.props.children
  }
}
