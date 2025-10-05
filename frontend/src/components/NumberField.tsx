import React from "react"

type Props = {
  label: string
  value: number | null | undefined
  onChange: (v: number | null) => void
  min?: number
  max?: number
  step?: number
}

export default function NumberField({ label, value, onChange, min, max, step }: Props) {
  const num = value ?? 0
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <input
          className="input w-40 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === "" ? null : Number(v))
          }}
        />
        <input
          className="range flex-grow rounded-md accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="range"
          min={min ?? 0}
          max={max ?? 100}
          step={step ?? 0.1}
          value={num}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="text-sm text-gray-600 min-w-[60px] text-right">Current: {num}</div>
      </div>
      <div className="text-gray-500 text-xs">
        Range: {min ?? 0} – {max ?? 100}{step ? ` (step ${step})` : ""}
      </div>
    </div>
  )
}
