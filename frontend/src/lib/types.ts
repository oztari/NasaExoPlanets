export type ModelName = "rf" | "lr"

export type PredictPayload = {
  koi_period?: number | null
  koi_duration?: number | null
  koi_depth?: number | null
  koi_prad?: number | null
  koi_model_snr?: number | null
  koi_snr?: number | null
  koi_score?: number | null
  koi_ror?: number | null
  koi_impact?: number | null
  koi_max_mult_ev?: number | null
  koi_fpflag_ss?: number | null
  koi_fpflag_co?: number | null
  koi_fpflag_nt?: number | null
  koi_fpflag_ec?: number | null
}

export type PredictResponse = {
  prediction: string
  confidence: number
}

export type KOIItem = {
  kepid: number
  kepoi_name?: string
  koi_disposition?: string
  koi_period?: number | null
  koi_duration?: number | null
  koi_depth?: number | null
  koi_prad?: number | null
  koi_model_snr?: number | null
  koi_snr?: number | null
  koi_score?: number | null
  koi_ror?: number | null
  koi_impact?: number | null
  koi_max_mult_ev?: number | null
  koi_fpflag_ss?: number | null
  koi_fpflag_co?: number | null
  koi_fpflag_nt?: number | null
  koi_fpflag_ec?: number | null
}
