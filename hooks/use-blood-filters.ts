import { useBloodFiltersStore } from "@/stores"

/**
 * Hook to manage blood filter state
 * Provides a clean interface for filter operations
 */
export function useBloodFilters() {
  const {
    searchLocation,
    selectedBloodType,
    selectedDistrictId,
    selectedStateId,
    minQuantity,
    setSearchLocation,
    setSelectedBloodType,
    setSelectedDistrictId,
    setSelectedStateId,
    setMinQuantity,
    clearFilters,
  } = useBloodFiltersStore()

  const hasActiveFilters =
    selectedBloodType ||
    selectedDistrictId !== "-1" ||
    selectedStateId ||
    searchLocation ||
    minQuantity > 0

  return {
    // Filter values
    searchLocation,
    selectedBloodType,
    selectedDistrictId,
    selectedStateId,
    minQuantity,
    hasActiveFilters,

    // Setters
    setSearchLocation,
    setSelectedBloodType,
    setSelectedDistrictId,
    setSelectedStateId,
    setMinQuantity,

    // Actions
    clearFilters,
  }
}

