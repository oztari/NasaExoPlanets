// src/pages/Researcher.tsx
import { useState } from "react"
import { predict } from "../lib/api"
import type { PredictPayload } from "../lib/types"
import "./researcher.css"

const DEFAULTS: PredictPayload = {
  koi_period: 10.5,
  koi_duration: 3.2,
  koi_depth: 500,
  koi_prad: 1.9,
  koi_model_snr: 15,
  koi_ror: 0.03,
  koi_impact: 0.2,
  koi_max_mult_ev: 1,
  koi_fpflag_ss: 0,
  koi_fpflag_co: 0,
  koi_fpflag_nt: 0,
  koi_fpflag_ec: 0,
}

type ModelKey = keyof PredictPayload

function toPercent(c: number) {
  const pct = c > 1 ? c : c * 100
  return Math.max(0, Math.min(100, Number(pct.toFixed(1))))
}

function FieldRow(props: {
  label: string
  k: ModelKey
  min: number
  max: number
  step: number
  value: number
  onChange: (k: ModelKey, v: number) => void
}) {
  const { label, k, min, max, step, value, onChange } = props
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <div className="field__inputs">
        <input
          type="number"
          className="field__number"
          value={Number.isFinite(value) ? value : min}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value === "" ? NaN : Number(e.target.value)
            onChange(k, Number.isFinite(v) ? v : min)
          }}
        />
        <input
          type="range"
          className="field__range"
          value={Number.isFinite(value) ? value : min}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(k, Number(e.target.value))}
        />
      </div>
      <div className="field__hint">Range: {min} – {max} (step {step})</div>
    </div>
  )
}

function FlagToggle(props: {
  label: string
  k: ModelKey
  value: number
  onChange: (k: ModelKey, v: number) => void
}) {
  const { label, k, value, onChange } = props
  return (
    <button
      type="button"
      className={`flag ${value ? "flag--on" : ""}`}
      onClick={() => onChange(k, value ? 0 : 1)}
      aria-pressed={value ? "true" : "false"}
    >
      <span className="flag__dot" />
      {label}
    </button>
  )
}

export default function Researcher() {
  // ✅ Use your current defaults as initial UI values
  const [payload, setPayload] = useState<PredictPayload>(DEFAULTS)

  // ✅ Default model is LR to match your curl & backend default
  const [model, setModel] = useState<"rf" | "lr">("lr")

  // Results + request state
  const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof PredictPayload>(key: K, val: PredictPayload[K]) {
    // ✅ Always pipe the latest on-screen values into payload
    setPayload((p) => ({ ...p, [key]: val }))
  }

  async function handlePredict() {
    try {
      const payload = {
        ...DEFAULTS,
        koi_depth: sliders.depth,
        koi_duration: sliders.duration,
        koi_impact: sliders.impactParameter,
        koi_max_mult_ev: sliders.maxMult,
        koi_period: sliders.period,
        koi_ror: sliders.radiusRatio,
        koi_snr: sliders.snr,
        koi_fpflag_ss: checkboxValues.fpflagSS,
        koi_fpflag_co: checkboxValues.fpflagCO,
        koi_fpflag_nt: checkboxValues.fpflagNT,
        koi_fpflag_ec: checkboxValues.fpflagEC
      }

      console.log("Payload", payload)
      setBusy(true); setError(null)
      const data = await predict(payload, model)
      console.log("Data received from backend:", data)
      setResult(data)
    } catch (e: any) {
      setError(e?.message ?? "Prediction failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rsch">
      {/* Top bar */}
      <div className="rsch__bar">
        <h1 className="rsch__title">Researcher Dashboard</h1>
        <div className="rsch__actions">
          {/* Put LR first to make the default obvious */}
          <select className="rsch__select" value={model} onChange={(e) => setModel(e.target.value as "rf" | "lr")}>
            <option value="lr">Logistic Regression</option>
            <option value="rf">Random Forest</option>
          </select>
          <button className="rsch__btn" onClick={handlePredict} disabled={busy}>
            {busy ? "Predicting…" : "Predict"}
          </button>
          {error && <span className="rsch__error">{error}</span>}
        </div>
      </div>

      <div className="rsch__grid">
        {/* Inputs */}
        <section className="panel panel--inputs">
          <h2 className="panel__heading">Transit observables</h2>
          <div className="panel__grid">
            <FieldRow label="koi_period (days)" k="koi_period" min={0.05} max={1000} step={0.05} value={payload.koi_period!} onChange={set} />
            <FieldRow label="koi_duration (hours)" k="koi_duration" min={0.05} max={30} step={0.05} value={payload.koi_duration!} onChange={set} />
            <FieldRow label="koi_depth (ppm)" k="koi_depth" min={5} max={100000} step={5} value={payload.koi_depth!} onChange={set} />
          </div>

          <h2 className="panel__heading">Geometry / size</h2>
          <div className="panel__grid">
            <FieldRow label="koi_ror (Rp/R★)" k="koi_ror" min={0} max={0.2} step={0.001} value={payload.koi_ror!} onChange={set} />
            <FieldRow label="koi_impact (b)" k="koi_impact" min={0} max={1.2} step={0.01} value={payload.koi_impact!} onChange={set} />
            <FieldRow label="koi_prad (R⊕)" k="koi_prad" min={0.1} max={25} step={0.1} value={payload.koi_prad!} onChange={set} />
          </div>

          <h2 className="panel__heading">Signal quality / system</h2>
          <div className="panel__grid">
            <FieldRow label="koi_model_snr" k="koi_model_snr" min={0} max={500} step={0.5} value={payload.koi_model_snr!} onChange={set} />
            <FieldRow label="koi_max_mult_ev" k="koi_max_mult_ev" min={0} max={10} step={1} value={payload.koi_max_mult_ev!} onChange={set} />
          </div>

          <h2 className="panel__heading">False-positive flags</h2>
          <div className="flags">
            <FlagToggle label="koi_fpflag_ss (stellar variability FP)" k="koi_fpflag_ss" value={payload.koi_fpflag_ss!} onChange={set} />
            <FlagToggle label="koi_fpflag_co (centroid offset FP)" k="koi_fpflag_co" value={payload.koi_fpflag_co!} onChange={set} />
            <FlagToggle label="koi_fpflag_nt (not transit-like)" k="koi_fpflag_nt" value={payload.koi_fpflag_nt!} onChange={set} />
            <FlagToggle label="koi_fpflag_ec (eclipsing binary)" k="koi_fpflag_ec" value={payload.koi_fpflag_ec!} onChange={set} />
          </div>
        </section>

        {/* Result */}
        <section className="panel panel--result">
          <h2 className="panel__heading">Result</h2>
          {result ? (
            <div className="result result--hero">
              <div className="result__pred">{result.prediction}</div>
              <div className="result__conf">Confidence: {toPercent(result.confidence)}%</div>
            </div>
          ) : (
            <div className="result result--empty">No prediction yet.</div>
          )}
        </section>
      </div>
    </div>
  )
}
