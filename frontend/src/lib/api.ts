// Frontend api layer that centralizes all calls to the FastAPI backend
// Exports functions (predict, listKoi) that components can use without worrying about HTTP details.
// Provides a fallback (sample JSON) so the UI isn’t broken if the backend is offline.
// Includes a formatter helper for clean display of numbers.
import axios from "axios"
import type { KOIItem, ModelName, PredictPayload, PredictResponse } from "./types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000" || "https://noncalculable-unmurmurously-marybeth.ngrok-free.dev"

export async function predict(payload: PredictPayload, model: ModelName = "rf") {
  const response = await axios.post<PredictResponse>(`${API_BASE}/predict?model=${model}`, payload, {
    headers: {
      'ngrok-skip-browser-warning': true
    }
  })
  console.log("Response ", response)
  return response.data
}

export async function listKoi(): Promise<KOIItem[]> {
  try {
    const { data } = await axios.get<KOIItem[]>(`${API_BASE}/koi/list`, {
      headers: {
        'ngrok-skip-browser-warning': true
      }
    })
    return data
  } catch {
    // Fallback to bundled sample if backend endpoint not present
    const res = await fetch("/koi_min.json")
    return res.json()
  }
}

export function fmt(val: number | null | undefined, digits = 3) {
  if (val === null || val === undefined || Number.isNaN(val)) return "—"
  return Number(val).toFixed(digits)
}
