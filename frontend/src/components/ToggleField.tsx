type Props = {
  label: string
  value: number | null | undefined
  onChange: (v: number) => void
}
export default function ToggleField({ label, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="accent-indigo-400 w-5 h-5"
        checked={(value ?? 0) === 1}
        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
      />
      <span className="label">{label}</span>
    </label>
  )
}
