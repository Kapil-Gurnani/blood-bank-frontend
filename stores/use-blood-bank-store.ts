import { create } from "zustand"
import { fetchStockNearby, type BloodStock } from "@/lib/api"

interface BloodBankState {
  stocks: BloodStock[]
  filteredStocks: BloodStock[]
  visibleRange: { start: number; end: number }
  loading: boolean
  error: string | null
  stocksFailed: boolean
  lastFetchParams: { stateId: string; districtId: string; bloodType: string } | null
  fetchStocks: (stateId: string, districtId?: string, bloodType?: string, force?: boolean) => Promise<void>
  setFilteredStocks: (stocks: BloodStock[]) => void
  setVisibleRange: (range: { start: number; end: number }) => void
  resetVisibleRange: () => void
  resetStocksError: () => void
}

export const useBloodBankStore = create<BloodBankState>((set, get) => ({
  stocks: [],
  filteredStocks: [],
  visibleRange: { start: 0, end: 10 },
  loading: false,
  error: null,
  stocksFailed: false,
  lastFetchParams: null,
  fetchStocks: async (
    stateId: string,
    districtId: string = "-1",
    bloodType: string = "all",
    force = false,
  ) => {
    if (!stateId) {
      set({ stocks: [], filteredStocks: [], loading: false, stocksFailed: false, lastFetchParams: null })
      return
    }

    const { stocksFailed, lastFetchParams } = get()
    const currentParams = { stateId, districtId, bloodType }

    // Don't retry if it failed before with same params, unless forced
    // But allow fetch if params changed (e.g., when clearing filters)
    const paramsChanged = !lastFetchParams || 
      lastFetchParams.stateId !== stateId || 
      lastFetchParams.districtId !== districtId || 
      lastFetchParams.bloodType !== bloodType

    if (stocksFailed && !force && !paramsChanged) {
      return
    }

    set({ loading: true, error: null, stocksFailed: false, lastFetchParams: currentParams })
    try {
      const response = await fetchStockNearby(stateId, districtId, bloodType)
      set({
        stocks: response.stocks,
        filteredStocks: response.stocks,
        loading: false,
        visibleRange: { start: 0, end: 10 },
        stocksFailed: false,
        lastFetchParams: currentParams,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch blood stocks",
        loading: false,
        stocks: [],
        filteredStocks: [],
        stocksFailed: true,
        lastFetchParams: currentParams,
      })
    }
  },
  setFilteredStocks: (stocks) => set({ filteredStocks: stocks }),
  setVisibleRange: (range) => set({ visibleRange: range }),
  resetVisibleRange: () => set({ visibleRange: { start: 0, end: 10 } }),
  resetStocksError: () => set({ stocksFailed: false, error: null }),
}))

