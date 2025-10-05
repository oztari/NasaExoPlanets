type Props = {
  label: string
  value: number | null | undefined
  onChange: (v: number) => void
}
export default function ToggleField({ label, value, onChange }: Props) {
  return (
    <label className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
      <span className="label">{label}</span>
      <input
        type="checkbox"
        className="accent-indigo-400 w-5 h-5"
        checked={(value ?? 0) === 1}
        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
      />
    </label>
  )
}
