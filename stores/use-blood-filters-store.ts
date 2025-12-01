import { create } from "zustand"

interface BloodFiltersState {
  searchLocation: string
  selectedBloodType: string
  selectedDistrictId: string
  selectedStateId: string
  minQuantity: number
  setSearchLocation: (location: string) => void
  setSelectedBloodType: (type: string) => void
  setSelectedDistrictId: (districtId: string) => void
  setSelectedStateId: (stateId: string) => void
  setMinQuantity: (quantity: number) => void
  clearFilters: (keepState?: boolean) => void
}

export const useBloodFiltersStore = create<BloodFiltersState>((set, get) => ({
  searchLocation: "",
  selectedBloodType: "",
  selectedDistrictId: "-1",
  selectedStateId: "",
  minQuantity: 0,
  setSearchLocation: (location) => set({ searchLocation: location }),
  setSelectedBloodType: (type) => set({ selectedBloodType: type }),
  setSelectedDistrictId: (districtId) => set({ selectedDistrictId: districtId }),
  setSelectedStateId: (stateId) => {
    set({ selectedStateId: stateId })
    // Reset district when state changes
    if (stateId) {
      set({ selectedDistrictId: "-1" })
    }
  },
  setMinQuantity: (quantity) => set({ minQuantity: quantity }),
  clearFilters: (keepState = true) => {
    const { selectedStateId } = get()
    set({
      searchLocation: "",
      selectedBloodType: "",
      selectedDistrictId: "-1",
      selectedStateId: keepState ? selectedStateId : "",
      minQuantity: 0,
    })
  },
}))

