'use client'

import { useEffect, useRef, useCallback } from 'react'

const WS_URL = (typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WS_URL || '')
  : '') || ''

export interface WSHandlers {
  [event: string]: (data: Record<string, unknown>) => void
}

export function useWebSocket(handlers: WSHandlers, enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>()
  const reconnectAttempts = useRef(0)
  const retryDelayRef = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || !enabled) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const baseUrl = WS_URL
      ? WS_URL
      : (typeof window !== 'undefined' ? window.location.origin : '')
    const wsUrl = baseUrl.startsWith('http')
      ? baseUrl.replace(/^http/, 'ws') + '/api/ws?token=' + encodeURIComponent(token)
      : baseUrl

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket(wsUrl)
    } catch {
      scheduleReconnect()
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      reconnectAttempts.current = 0
    }

    ws.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }
      const handler = handlers[msg.type]
      if (handler) handler(msg)
    }

    ws.onerror = () => {
      // handled by close
    }

    ws.onclose = () => {
      wsRef.current = null
      if (enabled) {
        scheduleReconnect()
      }
    }

    function scheduleReconnect() {
      reconnectAttempts.current += 1
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectRef.current = setTimeout(() => {
        reconnectAttempts.current = 0
        connect()
      }, delay)
    }
  }, [enabled, handlers])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (retryDelayRef.current) clearTimeout(retryDelayRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])
}
