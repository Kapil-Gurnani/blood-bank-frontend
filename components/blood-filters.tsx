"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { useBloodFilters, useStates, useDistricts } from "@/hooks"

interface BloodFiltersProps {
  bloodTypes: string[]
}

export function BloodFilters({ bloodTypes }: BloodFiltersProps) {
  const {
    searchLocation,
    selectedBloodType,
    selectedDistrictId,
    selectedStateId,
    minQuantity,
    hasActiveFilters,
    setSearchLocation,
    setSelectedBloodType,
    setSelectedDistrictId,
    setSelectedStateId,
    setMinQuantity,
    clearFilters,
  } = useBloodFilters()

  const { states, loading: loadingStates } = useStates()
  const { districts, loading: loadingDistricts } = useDistricts(selectedStateId || null)

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId === "all" ? "" : stateId)
  }

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId === "all" ? "-1" : districtId)
  }

  return (
    <Card className="bg-white dark:bg-slate-900">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Blood Bank</label>
              <Input
                placeholder="Search by name or location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={selectedStateId || "all"} onValueChange={handleStateChange} disabled={loadingStates}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingStates ? "Loading..." : "All states"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.stateId} value={state.stateId}>
                      {state.stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Blood Type</label>
              <Select value={selectedBloodType || "all"} onValueChange={(value) => setSelectedBloodType(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All blood types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All blood types</SelectItem>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">District</label>
              <Select
                value={selectedDistrictId === "-1" ? "all" : selectedDistrictId}
                onValueChange={handleDistrictChange}
                disabled={loadingDistricts || !selectedStateId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedStateId
                        ? "Select state first"
                        : loadingDistricts
                          ? "Loading..."
                          : "All districts"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.districtId} value={district.districtId}>
                      {district.districtName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min. Quantity</label>
              <Input
                type="number"
                placeholder="Minimum units"
                value={minQuantity || ""}
                onChange={(e) => setMinQuantity(e.target.value ? Number.parseInt(e.target.value) : 0)}
                min="0"
                className="w-full"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">Filters applied</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
