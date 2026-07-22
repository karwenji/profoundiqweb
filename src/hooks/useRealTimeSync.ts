import { useEffect, useRef, useCallback } from 'react'
import { getToken } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

interface EventSourceWithReconnect extends EventSource {
  _reconnectAttempts: number
  _maxReconnectAttempts: number
}

export function useRealTimeSync(eventHandlers: Record<string, (data: any) => void>, dependencies: unknown[] = []) {
  const eventSourceRef = useRef<EventSourceWithReconnect | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return
    const token = getToken()
    if (!token) return

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource(`${API_URL}/api/events/stream?token=${token}`) as EventSourceWithReconnect
    es._reconnectAttempts = 0
    es._maxReconnectAttempts = 10

    es.onopen = () => {
      es._reconnectAttempts = 0
      console.log('[SSE] Connected')
    }

    es.onerror = () => {
      es._reconnectAttempts++
      if (es._reconnectAttempts >= es._maxReconnectAttempts) {
        console.warn('[SSE] Max reconnection attempts reached, falling back to polling')
        es.close()
        return
      }
      const delay = Math.min(1000 * Math.pow(2, es._reconnectAttempts), 30000)
      reconnectTimeoutRef.current = setTimeout(connect, delay)
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          handler(JSON.parse(e.data))
        } catch (err) {
          console.error(`[SSE] Error handling event ${event}:`, err)
        }
      })
    })

    eventSourceRef.current = es
  }, [eventHandlers])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connect, ...dependencies])
}
