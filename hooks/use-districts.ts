import { useEffect, useRef } from "react"
import { useLocationStore } from "@/stores"

/**
 * Hook to fetch and manage districts for a given state
 * Automatically fetches districts when stateId changes
 * Won't retry automatically if the API call failed for the same stateId
 * @param stateId - The state ID to fetch districts for
 */
export function useDistricts(stateId: string | null) {
  const { districts, loadingDistricts, error, districtsFailed, fetchDistricts, clearDistricts } = useLocationStore()
  const lastStateIdRef = useRef<string | null>(null)

  useEffect(() => {
    const currentStateId = stateId
    
    // Only run when stateId actually changes
    if (lastStateIdRef.current === currentStateId) {
      return
    }

    // Update the ref first to prevent re-running
    lastStateIdRef.current = currentStateId

    if (currentStateId) {
      // Store will handle clearing districts when state changes
      fetchDistricts(currentStateId)
    } else {
      // Clear when stateId is null
      clearDistricts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]) // Only depend on stateId

  return {
    districts,
    loading: loadingDistricts,
    error,
    failed: districtsFailed,
    refetch: stateId ? () => fetchDistricts(stateId, true) : undefined, // Force refetch
  }
}

