// API Base URL - should include the full path to the blood-banks API
// For AWS: https://your-api.execute-api.us-east-1.amazonaws.com/prod/api/blood-banks
// For local: http://localhost:8080/api/blood-banks
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/blood-banks"

export interface State {
  stateId: string
  stateName: string
  stateCode: string
}

export interface StatesResponse {
  states: State[]
  totalResults: number
}

export interface District {
  districtId: string
  districtName: string
  districtCode: string
  stateId: string
}

export interface DistrictsResponse {
  districts: District[]
  totalResults: number
  stateId: string
  stateName: string | null
}

export interface BloodGroup {
  [key: string]: number
}

export interface BloodStock {
  bloodBankName: string
  bloodType: string | null
  unitsAvailable: number | null
  bloodGroups: BloodGroup | null
  address: string
  contact: string
  distance: number | null
  latitude: number | null
  longitude: number | null
}

export interface StockNearbyResponse {
  stocks: BloodStock[]
  totalResults: number
  location: string
  latitude: number | null
  longitude: number | null
}

/**
 * Fetch all states
 */
export async function fetchStates(): Promise<StatesResponse> {
  const response = await fetch(`${API_BASE_URL}/states`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch states: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch districts for a given state
 */
export async function fetchDistricts(stateId: string): Promise<DistrictsResponse> {
  const response = await fetch(`${API_BASE_URL}/districts?stateId=${stateId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch districts: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch blood stock nearby based on filters
 */
export async function fetchStockNearby(
  stateId: string,
  districtId: string = "-1",
  bloodType: string = "all",
): Promise<StockNearbyResponse> {
  const params = new URLSearchParams({
    stateId,
    districtId,
    bloodType,
  })

  const response = await fetch(`${API_BASE_URL}/stock-nearby?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stock nearby: ${response.statusText}`)
  }

  return response.json()
}

