import { useEffect, useCallback } from 'react'

type FetchFn = () => Promise<void>

// Custom hook for polling-based real-time updates.
// skipInitial: if true, only start polling after manual trigger; useful when the page already fetched on mount.
export function useRealTimeSync(fetchData: FetchFn, intervalMs: number = 30000, skipInitial = false) {
  const stableFetch = useCallback(fetchData, [fetchData])

  useEffect(() => {
    if (!skipInitial) {
      stableFetch()
    }

    const interval = setInterval(stableFetch, intervalMs)
    return () => clearInterval(interval)
  }, [stableFetch, intervalMs, skipInitial])
}

// Hook for manual refresh with loading state
export function useManualRefresh(fetchData: () => Promise<void>) {
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return { refresh }
}
