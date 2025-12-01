# Zustand Stores

This directory contains Zustand stores for managing application state.

## Available Stores

### 1. `useBloodFiltersStore`
Manages filter state for blood bank searches.

**State:**
- `searchLocation`: string
- `selectedBloodType`: string
- `selectedCity`: string
- `selectedState`: string
- `minQuantity`: number

**Actions:**
- `setSearchLocation(location: string)`
- `setSelectedBloodType(type: string)`
- `setSelectedCity(city: string)`
- `setSelectedState(state: string)`
- `setMinQuantity(quantity: number)`
- `clearFilters()` - Resets all filters to default values

**Example:**
```typescript
import { useBloodFiltersStore } from "@/stores"

function MyComponent() {
  const { 
    searchLocation, 
    selectedBloodType, 
    setSearchLocation,
    clearFilters 
  } = useBloodFiltersStore()
  
  return (
    <div>
      <input 
        value={searchLocation} 
        onChange={(e) => setSearchLocation(e.target.value)} 
      />
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  )
}
```

### 2. `useUIStore`
Manages UI state like modals, sidebars, etc.

**State:**
- `showVoiceChat`: boolean

**Actions:**
- `setShowVoiceChat(show: boolean)`
- `toggleVoiceChat()` - Toggles the voice chat visibility

**Example:**
```typescript
import { useUIStore } from "@/stores"

function Header() {
  const { showVoiceChat, toggleVoiceChat } = useUIStore()
  
  return (
    <button onClick={toggleVoiceChat}>
      {showVoiceChat ? "Hide" : "Show"} Voice Chat
    </button>
  )
}
```

### 3. `useBloodBankStore`
Manages blood bank data and filtered results.

**State:**
- `bloodBanks`: BloodBank[] - All blood banks
- `filteredBanks`: BloodBank[] - Filtered blood banks
- `visibleRange`: { start: number, end: number } - For virtual scrolling

**Actions:**
- `setBloodBanks(banks: BloodBank[])`
- `setFilteredBanks(banks: BloodBank[])`
- `setVisibleRange(range: { start: number, end: number })`
- `resetVisibleRange()` - Resets to default range

**Example:**
```typescript
import { useBloodBankStore } from "@/stores"

function BloodBankList() {
  const { filteredBanks, setFilteredBanks } = useBloodBankStore()
  
  // Use filteredBanks in your component
  return (
    <div>
      {filteredBanks.map(bank => (
        <div key={bank.id}>{bank.name}</div>
      ))}
    </div>
  )
}
```

## Usage Tips

1. **Selective Subscriptions**: Zustand automatically subscribes only to the state you use, so components will only re-render when the specific state they use changes.

2. **Shallow Comparison**: For complex state updates, you can use Zustand's `shallow` comparison:
```typescript
import { shallow } from "zustand/shallow"

const { searchLocation, selectedBloodType } = useBloodFiltersStore(
  (state) => ({ 
    searchLocation: state.searchLocation, 
    selectedBloodType: state.selectedBloodType 
  }),
  shallow
)
```

3. **Actions Outside Components**: You can call store actions outside of React components:
```typescript
import { useBloodFiltersStore } from "@/stores"

// In a utility function or API route
useBloodFiltersStore.getState().clearFilters()
```

