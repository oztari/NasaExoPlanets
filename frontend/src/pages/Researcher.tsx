import { useState } from "react";
import NumberField from "../components/NumberField";
import ToggleField from "../components/ToggleField";
import { predict } from "../lib/api";
import type { PredictPayload } from "../lib/types";

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
};

export default function Researcher() {
  const [payload, setPayload] = useState<PredictPayload>(DEFAULTS);
  const [model, setModel] = useState<"rf" | "lr">("rf");
  const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleReset() {
    setPayload(DEFAULTS);
    setResult(null);
    setError(null);
  }

  async function handlePredict() {
    try {
      setBusy(true);
      setError(null);
      const data = await predict(payload, model);
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Prediction failed");
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof PredictPayload>(key: K, val: PredictPayload[K]) {
    setPayload((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="page max-w-6xl mx-auto px-4 md:px-6">
      {/* HEADER */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20 border-b border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Researcher Dashboard</h1>
            <p className="text-white/70 text-sm mt-1">Choose a model, tweak inputs, run prediction. Clean, fast, minimal.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              className="select w-full md:w-56"
              value={model}
              onChange={(e) => setModel(e.target.value as "rf" | "lr")}
            >
              <option value="rf">🌲 Random Forest</option>
              <option value="lr">📈 Logistic Regression</option>
            </select>
            <button className="btn btn-primary whitespace-nowrap" onClick={handlePredict} disabled={busy}>
              {busy ? "Predicting…" : "Run Prediction"}
            </button>
            <button className="btn btn-ghost" onClick={handleReset} disabled={busy}>
              Reset
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
      </header>

      {/* CONTENT GRID */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* INPUTS */}
        <section className="card md:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent">
            <h2 className="text-lg font-semibold">Input Features</h2>
            <p className="text-white/60 text-sm mt-1">
              Reasonable defaults are pre-filled. Adjust what matters; ignore the rest.
            </p>
          </div>

          <div className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
            <NumberField label="koi_period (days)" value={payload.koi_period ?? null} onChange={(v) => set("koi_period", v)} min={0.05} max={1000} step={0.05} />
            <NumberField label="koi_duration (hours)" value={payload.koi_duration ?? null} onChange={(v) => set("koi_duration", v)} min={0.05} max={30} step={0.05} />
            <NumberField label="koi_depth (ppm)" value={payload.koi_depth ?? null} onChange={(v) => set("koi_depth", v)} min={5} max={100000} step={5} />
            <NumberField label="koi_prad (R⊕)" value={payload.koi_prad ?? null} onChange={(v) => set("koi_prad", v)} min={0.1} max={25} step={0.1} />
            <NumberField label="koi_model_snr" value={payload.koi_model_snr ?? null} onChange={(v) => set("koi_model_snr", v)} min={0} max={500} step={0.5} />
            <NumberField label="koi_ror (Rp/R★)" value={payload.koi_ror ?? null} onChange={(v) => set("koi_ror", v)} min={0} max={0.2} step={0.001} />
            <NumberField label="koi_impact (b)" value={payload.koi_impact ?? null} onChange={(v) => set("koi_impact", v)} min={0} max={1.2} step={0.01} />
            <NumberField label="koi_max_mult_ev" value={payload.koi_max_mult_ev ?? null} onChange={(v) => set("koi_max_mult_ev", v)} min={0} max={10} step={1} />
          </div>

          <div className="px-4 md:px-6 pb-5">
            <div className="grid md:grid-cols-2 gap-4">
              <ToggleField label="koi_fpflag_ss · stellar variability FP" value={payload.koi_fpflag_ss ?? 0} onChange={(v) => set("koi_fpflag_ss", v)} />
              <ToggleField label="koi_fpflag_co · centroid offset FP" value={payload.koi_fpflag_co ?? 0} onChange={(v) => set("koi_fpflag_co", v)} />
              <ToggleField label="koi_fpflag_nt · not transit-like" value={payload.koi_fpflag_nt ?? 0} onChange={(v) => set("koi_fpflag_nt", v)} />
              <ToggleField label="koi_fpflag_ec · eclipsing binary" value={payload.koi_fpflag_ec ?? 0} onChange={(v) => set("koi_fpflag_ec", v)} />
            </div>

            <details className="mt-4 group">
              <summary className="cursor-pointer inline-flex items-center gap-2 text-sm text-white/80">
                <span className="transition-transform group-open:rotate-90">▶</span>
                View JSON payload
              </summary>
              <pre className="mt-3 text-xs bg-black/30 rounded-xl p-3 overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
            </details>
          </div>
        </section>

        {/* RESULT */}
        <aside className="card md:sticky md:top-20 h-fit overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-transparent">
            <h3 className="text-lg font-semibold">Result</h3>
            <div className="text-xs text-white/60 mt-1">
              Model: <span className="inline-block px-2 py-0.5 rounded-full bg-white/10">{model.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            {result ? (
              <>
                <div className="text-2xl font-semibold tracking-tight">{result.prediction}</div>
                <div className="text-white/70">
                  Confidence: <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                    style={{ width: `${Math.max(0, Math.min(100, result.confidence * 100)).toFixed(1)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-white/60">No prediction yet.</div>
            )}

            {busy && <div className="text-white/60 text-sm">Predicting…</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
