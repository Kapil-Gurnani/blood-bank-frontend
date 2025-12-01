"use client"

import { useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplet, MapPin, Phone, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import { BloodFilters } from "./blood-filters"
import { useBloodStocks, useBloodFilters } from "@/hooks"
import { type BloodStock } from "@/lib/api"

const CARD_HEIGHT = 280
const SCROLL_BUFFER = 2

export function BloodInventoryPage() {
  const {
    stocks: filteredStocks,
    visibleRange,
    loading,
    error,
    bloodTypes,
    stats,
    setVisibleRange,
  } = useBloodStocks()

  const { selectedStateId } = useBloodFilters()

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return

    const scrollTop = scrollContainerRef.current.scrollTop
    const containerHeight = scrollContainerRef.current.clientHeight

    const visibleItems = Math.ceil(containerHeight / CARD_HEIGHT) + SCROLL_BUFFER
    const startIndex = Math.max(0, Math.floor(scrollTop / CARD_HEIGHT) - SCROLL_BUFFER)
    const endIndex = startIndex + visibleItems

    setVisibleRange({ start: startIndex, end: endIndex })
  }, [setVisibleRange])

  const { totalUnits, availableBanks, uniqueBloodTypesCount } = stats

  const visibleStocks = filteredStocks.slice(visibleRange.start, visibleRange.end)
  const offsetY = visibleRange.start * CARD_HEIGHT

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Units</p>
                <p className="text-3xl font-bold text-foreground mt-2">{totalUnits}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Droplet className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Blood Banks</p>
                <p className="text-3xl font-bold text-foreground mt-2">{availableBanks}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Blood Types</p>
                <p className="text-3xl font-bold text-foreground mt-2">{uniqueBloodTypesCount}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BloodFilters bloodTypes={bloodTypes} />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Available Blood Banks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing <span className="font-semibold text-foreground">{visibleStocks.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredStocks.length}</span> result
            {filteredStocks.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading blood banks...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold">Error loading blood banks</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Blood Banks List with Virtual Scrolling */}
      {!loading && !error ? (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-[600px] overflow-y-auto pr-4 rounded-lg border border-border/50 bg-card/30"
        >
          {filteredStocks.length > 0 ? (
            <div style={{ height: filteredStocks.length * CARD_HEIGHT }}>
              <div style={{ transform: `translateY(${offsetY}px)` }} className="space-y-4">
                {visibleStocks.map((stock, index) => (
                  <BloodStockCard key={`${stock.bloodBankName}-${index}`} stock={stock} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="border-dashed border-2 border-border">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground font-semibold">No blood banks found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedStateId
                      ? "Try adjusting your filters or search terms"
                      : "Please select a state to view available blood banks"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function BloodStockCard({ stock }: { readonly stock: BloodStock }) {
  const getBloodTypeColor = (type: string) => {
    // Normalize type format (handle both "A+Ve" and "A+" formats)
    const normalizedType = type.replace("Ve", "").trim()
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      "O+": {
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
      },
      "O-": {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        border: "border-red-300 dark:border-red-700",
      },
      "A+": {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
      },
      "A-": {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-300",
        border: "border-orange-300 dark:border-orange-700",
      },
      "B+": {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
      },
      "B-": {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-700",
      },
      "AB+": {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
      },
      "AB-": {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        border: "border-purple-300 dark:border-purple-700",
      },
    }
    return (
      colors[normalizedType] || {
        bg: "bg-gray-50 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-700",
      }
    )
  }

  const totalQuantity = stock.bloodGroups
    ? Object.values(stock.bloodGroups).reduce((sum, qty) => sum + qty, 0)
    : 0
  const hasLowStock = stock.bloodGroups
    ? Object.values(stock.bloodGroups).some((qty) => qty < 3)
    : false

  const bloodGroups = stock.bloodGroups ? Object.entries(stock.bloodGroups) : []

  return (
    <Card className="border-border/50 transition-all duration-200 hover:shadow-lg hover:border-primary/40 mx-4">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground font-semibold">{stock.bloodBankName}</CardTitle>
            <CardDescription className="text-sm mt-1.5 text-muted-foreground">{stock.address}</CardDescription>
          </div>
          {totalQuantity > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Droplet className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-primary">{totalQuantity} Units</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-4">
              Blood Components
            </p>
            {bloodGroups.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bloodGroups.map(([bloodType, quantity]) => {
                  const color = getBloodTypeColor(bloodType)
                  const isLow = quantity < 3
                  const displayType = bloodType.replace("Ve", "").trim()

                  return (
                    <div
                      key={bloodType}
                      className={`p-3 rounded-lg border ${color.bg} ${color.border} flex flex-col items-center justify-center`}
                    >
                      <p className={`font-bold text-lg ${color.text}`}>{displayType}</p>
                      <p className={`text-xs font-semibold mt-1 ${color.text}`}>{quantity} units</p>
                      {isLow && <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">Low</p>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blood group information available</p>
            )}
          </div>

          <div className="space-y-4">
            {stock.contact && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Contact</p>
                  <a href={`tel:${stock.contact}`} className="text-sm font-medium text-primary hover:underline mt-1">
                    {stock.contact}
                  </a>
                </div>
              </div>
            )}
            {hasLowStock && (
              <div className="mt-4 p-2 bg-accent/10 rounded text-xs font-semibold text-accent border border-accent/30 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Low stock alert
              </div>
            )}
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-md hover:shadow-lg transition-all mt-4">
              Request Blood
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
