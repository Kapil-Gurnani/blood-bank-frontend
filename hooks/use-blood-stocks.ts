import { useEffect, useMemo } from "react"
import { useBloodBankStore, useBloodFiltersStore } from "@/stores"
import { type BloodStock } from "@/lib/api"

interface UseBloodStocksOptions {
  autoFetch?: boolean
}

/**
 * Hook to fetch and manage blood stocks
 * Automatically fetches stocks when filters change
 * @param options - Configuration options
 */
export function useBloodStocks(options: UseBloodStocksOptions = { autoFetch: true }) {
  const { selectedStateId, selectedDistrictId, selectedBloodType, searchLocation, minQuantity } =
    useBloodFiltersStore()

  const {
    stocks,
    filteredStocks,
    visibleRange,
    loading,
    error,
    stocksFailed,
    fetchStocks,
    setFilteredStocks,
    setVisibleRange,
  } = useBloodBankStore()

  // Fetch stocks when filters change
  useEffect(() => {
    // Only fetch if autoFetch is enabled and stateId is selected
    if (options.autoFetch && selectedStateId) {
      const bloodType = selectedBloodType || "all"
      const districtId = selectedDistrictId || "-1"
      // Always fetch, even if previously failed (allows retry after clearing filters)
      fetchStocks(selectedStateId, districtId, bloodType, false)
    }
  }, [selectedStateId, selectedDistrictId, selectedBloodType, options.autoFetch, fetchStocks])

  // Filter stocks based on search and min quantity
  useEffect(() => {
    let filtered = [...stocks]

    // Filter by search location
    if (searchLocation) {
      filtered = filtered.filter(
        (stock) =>
          stock.bloodBankName.toLowerCase().includes(searchLocation.toLowerCase()) ||
          stock.address.toLowerCase().includes(searchLocation.toLowerCase()),
      )
    }

    // Filter by min quantity
    if (minQuantity > 0) {
      filtered = filtered.filter((stock) => {
        if (!stock.bloodGroups) return false
        const totalUnits = Object.values(stock.bloodGroups).reduce((sum, qty) => sum + qty, 0)
        return totalUnits >= minQuantity
      })
    }

    setFilteredStocks(filtered)
    setVisibleRange({ start: 0, end: 10 })
  }, [searchLocation, minQuantity, stocks, setFilteredStocks, setVisibleRange])

  // Extract unique blood types from stocks
  const bloodTypes = useMemo(() => {
    const types = new Set<string>()
    stocks.forEach((stock) => {
      if (stock.bloodGroups) {
        Object.keys(stock.bloodGroups).forEach((type) => {
          // Convert "A+Ve" to "A+" format for display
          const displayType = type.replace("Ve", "").trim()
          types.add(displayType)
        })
      }
    })
    return Array.from(types).sort((a, b) => a.localeCompare(b))
  }, [stocks])

  // Calculate stats
  const stats = useMemo(() => {
    const totalUnits = filteredStocks.reduce((sum, stock) => {
      if (!stock.bloodGroups) return sum
      return sum + Object.values(stock.bloodGroups).reduce((s, qty) => s + qty, 0)
    }, 0)

    const uniqueBloodTypesCount = new Set<string>()
    filteredStocks.forEach((stock) => {
      if (stock.bloodGroups) {
        Object.keys(stock.bloodGroups).forEach((type) => uniqueBloodTypesCount.add(type))
      }
    })

    return {
      totalUnits,
      availableBanks: filteredStocks.length,
      uniqueBloodTypesCount: uniqueBloodTypesCount.size,
    }
  }, [filteredStocks])

  const refetch = useMemo(() => {
    if (!selectedStateId) return undefined
    return () => {
      const bloodType = selectedBloodType || "all"
      const districtId = selectedDistrictId || "-1"
      fetchStocks(selectedStateId, districtId, bloodType, true) // Force refetch
    }
  }, [selectedStateId, selectedDistrictId, selectedBloodType, fetchStocks])

  return {
    stocks: filteredStocks,
    allStocks: stocks,
    visibleRange,
    loading,
    error,
    failed: stocksFailed,
    bloodTypes,
    stats,
    refetch,
    setVisibleRange,
  }
}

