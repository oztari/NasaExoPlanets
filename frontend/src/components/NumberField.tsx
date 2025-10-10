import React from "react"

type Props = {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  min?: number
  max?: number
  step?: number
}

export default function NumberField({ label, value, onChange, min, max, step }: Props) {
  const [textValue, setTextValue] = React.useState("")

  // Sync when parent value changes from outside
  React.useEffect(() => {
    const asString = value === null ? "" : String(value)
    setTextValue(asString)
  }, [value])

  // Slider always needs a number for display
  const sliderValue = value === null ? (min ?? 0) : value

  return (
    <div className="space-y-1">
      <div className="label">{label}</div>
      <div className="flex items-center gap-3">
        {/* Number input */}
        <input
          className="input"
          type="number"
          value={textValue}
          onChange={(e) => {
            const v = e.target.value
            setTextValue(v)

            if (v === "") {
              // allow empty
              onChange(null)
            } else {
              const num = Number(v)
              if (!isNaN(num)) {
                onChange(num)
              }
            }
          }}
        />

        {/* Range slider */}
        <input
          className="range"
          type="range"
          min={min ?? 0}
          max={max ?? 100}
          step={step ?? 0.1}
          value={sliderValue}
          onChange={(e) => {
            // only commit a number when user actually moves slider
            const num = Number(e.target.value)
            onChange(num)
          }}
        />
      </div>

      <div className="text-white/60 text-xs">
        Range: {min ?? 0} – {max ?? 100}{step ? ` (step ${step})` : ""}
      </div>
    </div>
  )
}
