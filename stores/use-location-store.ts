import { create } from "zustand"
import { fetchStates, fetchDistricts, type State, type District } from "@/lib/api"

interface LocationState {
  states: State[]
  districts: District[]
  loadingStates: boolean
  loadingDistricts: boolean
  error: string | null
  statesFailed: boolean
  districtsFailed: boolean
  lastStateId: string | null
  fetchStates: (force?: boolean) => Promise<void>
  fetchDistricts: (stateId: string, force?: boolean) => Promise<void>
  clearDistricts: () => void
  resetStatesError: () => void
  resetDistrictsError: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  states: [],
  districts: [],
  loadingStates: false,
  loadingDistricts: false,
  error: null,
  statesFailed: false,
  districtsFailed: false,
  lastStateId: null,
  fetchStates: async (force = false) => {
    const { states, statesFailed } = get()
    
    // Don't retry if it failed before, unless forced
    if (statesFailed && !force) {
      return
    }
    
    // Already loaded, skip (unless forced)
    if (states.length > 0 && !force) {
      return
    }

    set({ loadingStates: true, error: null, statesFailed: false })
    try {
      const response = await fetchStates()
      set({ states: response.states, loadingStates: false, statesFailed: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch states",
        loadingStates: false,
        statesFailed: true,
      })
    }
  },
  fetchDistricts: async (stateId: string, force = false) => {
    if (!stateId) {
      set({ districts: [], districtsFailed: false })
      return
    }

    const { districtsFailed, districts, lastStateId } = get()
    
    // Track which state we last fetched for
    const stateChanged = lastStateId !== stateId
    
    // Don't retry if it failed before for the same state, unless forced
    if (districtsFailed && !force && !stateChanged) {
      return
    }

    // Clear districts if state changed
    if (stateChanged) {
      set({ districts: [], districtsFailed: false, error: null })
    }

    set({ loadingDistricts: true, error: null, districtsFailed: false, lastStateId: stateId })
    try {
      const response = await fetchDistricts(stateId)
      set({ districts: response.districts, loadingDistricts: false, districtsFailed: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch districts",
        loadingDistricts: false,
        districts: [],
        districtsFailed: true,
      })
    }
  },
  clearDistricts: () => set({ districts: [], districtsFailed: false, error: null, lastStateId: null }),
  resetStatesError: () => set({ statesFailed: false, error: null }),
  resetDistrictsError: () => set({ districtsFailed: false, error: null }),
}))

