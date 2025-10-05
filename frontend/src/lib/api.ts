import axios from "axios"
import type { KOIItem, ModelName, PredictPayload, PredictResponse } from "./types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export async function predict(payload: PredictPayload, model: ModelName = "rf") {
  const response = await axios.post<PredictResponse>(`${API_BASE}/predict?model=${model}`, payload)
  console.log("Response ", response)
  return response.data
}

export async function listKoi(): Promise<KOIItem[]> {
  try {
    const { data } = await axios.get<KOIItem[]>(`${API_BASE}/koi/list`)
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
