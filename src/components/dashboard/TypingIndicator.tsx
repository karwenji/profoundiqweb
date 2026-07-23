'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

export function TypingIndicator({ conversationId }: { conversationId: string }) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useWebSocket({
    user_typing: (data) => {
      if (data.conversationId === conversationId && !typingUsers.includes(data.userId as string)) {
        setTypingUsers((prev) => [...prev, data.userId as string])
      }
    },
    user_stop_typing: (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
      }
    },
    new_message: () => {
      setTypingUsers([])
    },
  }, !!conversationId)

  useEffect(() => {
    if (typingUsers.length === 0) return
    const timer = setTimeout(() => setTypingUsers([]), 3000)
    return () => clearTimeout(timer)
  }, [typingUsers])

  if (typingUsers.length === 0) return null

  return (
    <div className="text-xs text-gray-400 italic animate-pulse px-4 py-1">
      {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
    </div>
  )
}
