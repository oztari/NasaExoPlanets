    import { useMemo, useState } from "react"
    import NumberField from "../components/NumberField"
    import ToggleField from "../components/ToggleField"
    import { predict } from "../lib/api"
    import type { PredictPayload } from "../lib/types"

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
      koi_fpflag_ec: 0
    }

    export default function Researcher() {
      const [payload, setPayload] = useState<PredictPayload>(DEFAULTS)
      const [model, setModel] = useState<"rf" | "lr">("rf")
      const [result, setResult] = useState<{prediction: string, confidence: number} | null>(null)
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState<string | null>(null)

      async function handlePredict() {
        try {
          setBusy(true); setError(null)
          console.log("🚀 Starting prediction with:", { payload, model })
          const data = await predict(payload, model)
          console.log("✅ Prediction successful:", data)
          setResult(data)
        } catch (e: any) {
          console.error("❌ Prediction error:", e)
          setError(e?.message ?? "Prediction failed")
        } finally {
          setBusy(false)
        }
      }

      function set<K extends keyof PredictPayload>(key: K, val: PredictPayload[K]) {
        setPayload(p => ({...p, [key]: val}))
      }

      return (
        <div className="grid md:grid-cols-3 gap-6">
          <br />
          <br />
          <br />
          <br />
          <br />
             <div className="mt-4 flex items-center gap-3">
              <select className="select w-48" value={model} onChange={e => setModel(e.target.value as "rf" | "lr")}>
                <option value="rf">Random Forest</option>
                <option value="lr">Logistic Regression</option>
              </select>
              <button className="btn" onClick={handlePredict} disabled={busy}>{busy ? "Predicting..." : "Predict"}</button>
              {error && <span className="text-red-400">{error}</span>}
            </div>
          <section className="card md:col-span-2">
            <h2 className="text-xl font-semibold">Researcher Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <NumberField label="koi_period (days)" value={payload.koi_period ?? null} onChange={v => set("koi_period", v)} min={0.05} max={1000} step={0.05} />
              <NumberField label="koi_duration (hours)" value={payload.koi_duration ?? null} onChange={v => set("koi_duration", v)} min={0.05} max={30} step={0.05} />
              <NumberField label="koi_depth (ppm)" value={payload.koi_depth ?? null} onChange={v => set("koi_depth", v)} min={5} max={100000} step={5} />
              <NumberField label="koi_prad (R⊕)" value={payload.koi_prad ?? null} onChange={v => set("koi_prad", v)} min={0.1} max={25} step={0.1} />
              <NumberField label="koi_model_snr" value={payload.koi_model_snr ?? null} onChange={v => set("koi_model_snr", v)} min={0} max={500} step={0.5} />
              <NumberField label="koi_ror (Rp/R★)" value={payload.koi_ror ?? null} onChange={v => set("koi_ror", v)} min={0} max={0.2} step={0.001} />
              <NumberField label="koi_impact (b)" value={payload.koi_impact ?? null} onChange={v => set("koi_impact", v)} min={0} max={1.2} step={0.01} />
              <NumberField label="koi_max_mult_ev" value={payload.koi_max_mult_ev ?? null} onChange={v => set("koi_max_mult_ev", v)} min={0} max={10} step={1} />
              <ToggleField label="koi_fpflag_ss (stellar variability FP)" value={payload.koi_fpflag_ss ?? 0} onChange={v => set("koi_fpflag_ss", v)} />
              <ToggleField label="koi_fpflag_co (centroid offset FP)" value={payload.koi_fpflag_co ?? 0} onChange={v => set("koi_fpflag_co", v)} />
              <ToggleField label="koi_fpflag_nt (not transit-like)" value={payload.koi_fpflag_nt ?? 0} onChange={v => set("koi_fpflag_nt", v)} />
              <ToggleField label="koi_fpflag_ec (eclipsing binary)" value={payload.koi_fpflag_ec ?? 0} onChange={v => set("koi_fpflag_ec", v)} />
            </div>

         
          </section>

          <section className="card">
            <h3 className="text-lg font-semibold">Result</h3>
            <div className="mt-2">
              {result ? (
                <div>
                  <div className="text-white/90 text-xl">{result.prediction}</div>
                  <div className="text-white/70">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                </div>
              ) : <div className="text-white/60">No prediction yet.</div>}
            </div>
            <pre className="mt-4 text-xs bg-black/30 rounded-xl p-3 overflow-auto">
{JSON.stringify(payload, null, 2)}
            </pre>
          </section>
        </div>
      )
    }
