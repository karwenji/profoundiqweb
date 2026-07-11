import { useEffect, useCallback } from 'react'

// Custom hook for polling-based real-time updates (more reliable than WebSocket for now)
export function useRealTimeSync(fetchData: () => Promise<void>, intervalMs: number = 10000) {
  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up polling interval
    const interval = setInterval(fetchData, intervalMs)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [fetchData, intervalMs])
}

// Hook for manual refresh with loading state
export function useManualRefresh(fetchData: () => Promise<void>) {
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return { refresh }
}
