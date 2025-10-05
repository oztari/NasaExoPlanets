
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
    <div className="space-y-1">
      <div className="label">{label}</div>
      <div className="flex items-center gap-3">
        <input
          className="input"
          type="number"
          value={value ?? ""}
          placeholder=""
          onChange={(e) => {
            const v = e.target.value
            onChange(v === "" ? null : Number(v))
          }}
        />
        <input
          className="range"
          type="range"
          min={min ?? 0}
          max={max ?? 100}
          step={step ?? 0.1}
          value={num}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="text-white/60 text-xs">
        Range: {min ?? 0} – {max ?? 100}{step ? ` (step ${step})` : ""}
      </div>
    </div>
  )
}
