# Custom Hooks

This directory contains custom React hooks that encapsulate API calls and state management using Zustand stores.

## Available Hooks

### `useStates()`

Hook to fetch and manage states. Automatically fetches states on mount if not already loaded.

```typescript
import { useStates } from "@/hooks"

function MyComponent() {
  const { states, loading, error, refetch } = useStates()
  
  return (
    <div>
      {loading && <p>Loading states...</p>}
      {error && <p>Error: {error}</p>}
      {states.map(state => (
        <div key={state.stateId}>{state.stateName}</div>
      ))}
    </div>
  )
}
```

**Returns:**
- `states: State[]` - Array of states
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `refetch: () => Promise<void>` - Function to manually refetch states

---

### `useDistricts(stateId)`

Hook to fetch and manage districts for a given state. Automatically fetches districts when `stateId` changes.

```typescript
import { useDistricts } from "@/hooks"

function MyComponent() {
  const stateId = "97" // Delhi
  const { districts, loading, error, refetch } = useDistricts(stateId)
  
  return (
    <div>
      {loading && <p>Loading districts...</p>}
      {districts.map(district => (
        <div key={district.districtId}>{district.districtName}</div>
      ))}
    </div>
  )
}
```

**Parameters:**
- `stateId: string | null` - The state ID to fetch districts for. Pass `null` to clear districts.

**Returns:**
- `districts: District[]` - Array of districts
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `refetch: (() => Promise<void>) | undefined` - Function to manually refetch districts (only available if stateId is provided)

---

### `useBloodStocks(options?)`

Hook to fetch and manage blood stocks. Automatically fetches stocks when filters change and handles client-side filtering.

```typescript
import { useBloodStocks } from "@/hooks"

function MyComponent() {
  const {
    stocks,
    visibleRange,
    loading,
    error,
    bloodTypes,
    stats,
    refetch,
    setVisibleRange,
  } = useBloodStocks()
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      <p>Total Units: {stats.totalUnits}</p>
      <p>Available Banks: {stats.availableBanks}</p>
      {stocks.map(stock => (
        <div key={stock.bloodBankName}>{stock.bloodBankName}</div>
      ))}
    </div>
  )
}
```

**Parameters:**
- `options?: { autoFetch?: boolean }` - Configuration options
  - `autoFetch: boolean` - Whether to automatically fetch stocks when filters change (default: `true`)

**Returns:**
- `stocks: BloodStock[]` - Filtered blood stocks (already filtered by search and min quantity)
- `allStocks: BloodStock[]` - All fetched stocks (before client-side filtering)
- `visibleRange: { start: number, end: number }` - Current visible range for virtual scrolling
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `bloodTypes: string[]` - Unique blood types extracted from stocks
- `stats: { totalUnits: number, availableBanks: number, uniqueBloodTypesCount: number }` - Calculated statistics
- `refetch: (() => Promise<void>) | undefined` - Function to manually refetch stocks
- `setVisibleRange: (range: { start: number, end: number }) => void` - Function to update visible range

---

### `useBloodFilters()`

Hook to manage blood filter state. Provides a clean interface for filter operations.

```typescript
import { useBloodFilters } from "@/hooks"

function MyComponent() {
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
  
  return (
    <div>
      <input
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
      />
      {hasActiveFilters && (
        <button onClick={clearFilters}>Clear Filters</button>
      )}
    </div>
  )
}
```

**Returns:**
- `searchLocation: string` - Current search location
- `selectedBloodType: string` - Selected blood type (empty string for "all")
- `selectedDistrictId: string` - Selected district ID ("-1" for "all")
- `selectedStateId: string` - Selected state ID (empty string for "all")
- `minQuantity: number` - Minimum quantity filter
- `hasActiveFilters: boolean` - Whether any filters are active
- `setSearchLocation: (location: string) => void` - Set search location
- `setSelectedBloodType: (type: string) => void` - Set selected blood type
- `setSelectedDistrictId: (districtId: string) => void` - Set selected district ID
- `setSelectedStateId: (stateId: string) => void` - Set selected state ID (also clears district)
- `setMinQuantity: (quantity: number) => void` - Set minimum quantity
- `clearFilters: () => void` - Clear all filters

---

## Usage Pattern

The hooks are designed to work together seamlessly:

```typescript
import { useStates, useDistricts, useBloodFilters, useBloodStocks } from "@/hooks"

function BloodBankSearch() {
  // Fetch states automatically
  const { states, loading: loadingStates } = useStates()
  
  // Get current filters
  const { selectedStateId, setSelectedStateId } = useBloodFilters()
  
  // Fetch districts when state is selected
  const { districts, loading: loadingDistricts } = useDistricts(selectedStateId || null)
  
  // Fetch and filter blood stocks automatically
  const { stocks, loading: loadingStocks, stats } = useBloodStocks()
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  )
}
```

## Benefits

1. **Separation of Concerns**: API logic is separated from component logic
2. **Reusability**: Hooks can be used across multiple components
3. **Automatic State Management**: Zustand handles state updates and subscriptions
4. **Type Safety**: Full TypeScript support
5. **Loading & Error Handling**: Built-in loading and error states
6. **Automatic Fetching**: Hooks automatically fetch data when dependencies change

