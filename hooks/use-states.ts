import { useEffect } from "react"
import { useLocationStore } from "@/stores"

/**
 * Hook to fetch and manage states
 * Automatically fetches states on mount if not already loaded
 * Won't retry automatically if the API call failed
 */
export function useStates() {
  const { states, loadingStates, error, statesFailed, fetchStates } = useLocationStore()

  useEffect(() => {
    // Only fetch if not loaded, not loading, and hasn't failed
    if (states.length === 0 && !loadingStates && !statesFailed) {
      fetchStates()
    }
  }, [states.length, loadingStates, statesFailed, fetchStates])

  return {
    states,
    loading: loadingStates,
    error,
    failed: statesFailed,
    refetch: () => fetchStates(true), // Force refetch
  }
}

