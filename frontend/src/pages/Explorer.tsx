import { useEffect, useMemo, useRef, useState } from "react";
import { fmt, listKoi, predict } from "../lib/api";
import { type KOIItem, type PredictPayload, } from "../lib/types";
import NumberField from "../components/NumberField";
import ToggleField from "../components/ToggleField";

export default function Explorer() {
  const [items, setItems] = useState<KOIItem[]>([])
  const [q, setQ] = useState("")
  const [sel, setSel] = useState<KOIItem | null>(null)
  const [sim, setSim] = useState<PredictPayload | null>(null)
  const [result, setResult] = useState<{prediction: string, confidence: number} | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { (async () => {
    const data = await listKoi()
    setItems(data)
    if (data.length) { setSel(data[0]); setSim(pickPayload(data[0])) }
  })() }, [])

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return items
    return items.filter(it =>
      String(it.kepid).includes(k) ||
      (it.kepoi_name ?? "").toLowerCase().includes(k)
    )
  }, [items, q])

  function pickPayload(row: KOIItem): PredictPayload {
    return {
      koi_period: row.koi_period ?? null,
      koi_duration: row.koi_duration ?? null,
      koi_depth: row.koi_depth ?? null,
      koi_prad: row.koi_prad ?? null,
      koi_model_snr: row.koi_model_snr ?? null,
      koi_snr: row.koi_snr ?? null,
      koi_score: row.koi_score ?? null,
      koi_ror: row.koi_ror ?? null,
      koi_impact: row.koi_impact ?? null,
      koi_max_mult_ev: row.koi_max_mult_ev ?? null,
      koi_fpflag_ss: row.koi_fpflag_ss ?? null,
      koi_fpflag_co: row.koi_fpflag_co ?? null,
      koi_fpflag_nt: row.koi_fpflag_nt ?? null,
      koi_fpflag_ec: row.koi_fpflag_ec ?? null,
    }
  }

  async function runPredict() {
    if (!sim) return
    setBusy(true)
    const out = await predict(sim, "rf")
    setResult(out)
    setBusy(false)
  }

  useEffect(() => { // auto run when sim changes (debounced)
    const id = setTimeout(runPredict, 350)
    return () => clearTimeout(id)
  }, [JSON.stringify(sim)])

  function set<K extends keyof PredictPayload>(key: K, val: PredictPayload[K]) {
    setSim(p => ({...p!, [key]: val}))
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <section className="card">
        <h2 className="text-xl font-semibold">KOI Browser</h2>
        <input className="input mt-2" placeholder="Search by kepid or KOI name..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="mt-3 max-h-[60vh] overflow-auto divide-y divide-white/5">
          {filtered.slice(0, 200).map(row => (
            <button
              key={row.kepid}
              onClick={() => { setSel(row); setSim(pickPayload(row)); setResult(null) }}
              className={"w-full text-left px-3 py-2 hover:bg-white/10 " + (sel?.kepid === row.kepid ? "bg-white/10" : "")}
            >
              <div className="font-medium">{row.kepoi_name ?? `KepID ${row.kepid}`}</div>
              <div className="text-white/60 text-sm">Disposition: {row.koi_disposition ?? "—"}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-white/60 p-3">No matches.</div>}
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold">Non‑technical Summary</h3>
        {!sel ? <div className="text-white/70">Pick a KOI</div> : (
          <div className="space-y-2 text-white/80">
            <div><b>Name:</b> {sel.kepoi_name ?? `KepID ${sel.kepid}`}</div>
            <div><b>Current archive disposition:</b> {sel.koi_disposition ?? "—"}</div>
            <div className="text-white/60 text-sm">This tool uses your ML model to predict whether the signal is consistent with a transiting exoplanet. It is an aid, not a formal confirmation.</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-xl p-3"><b>Period</b><div>{fmt(sel.koi_period)} d</div></div>
              <div className="bg-white/5 rounded-xl p-3"><b>Duration</b><div>{fmt(sel.koi_duration)} h</div></div>
              <div className="bg-white/5 rounded-xl p-3"><b>Depth</b><div>{fmt(sel.koi_depth)} ppm</div></div>
              <div className="bg-white/5 rounded-xl p-3"><b>Radius</b><div>{fmt(sel.koi_prad)} R⊕</div></div>
              <div className="bg-white/5 rounded-xl p-3"><b>SNR</b><div>{fmt(sel.koi_model_snr)}</div></div>
              <div className="bg-white/5 rounded-xl p-3"><b>Impact (b)</b><div>{fmt(sel.koi_impact)}</div></div>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold">Simulate</h3>
        {!sim ? <div className="text-white/70">Select a KOI first</div> : (
          <div className="space-y-3">
            <div className="text-white/70 text-sm">Move sliders to see how feature changes affect the predicted class. This does not change the archive value.</div>
            <div className="grid grid-cols-1 gap-3">
              <NumberField label="koi_period (days)" value={sim.koi_period ?? null} onChange={v => set("koi_period", v)} min={0.05} max={1000} step={0.05} />
              <NumberField label="koi_duration (hours)" value={sim.koi_duration ?? null} onChange={v => set("koi_duration", v)} min={0.05} max={30} step={0.05} />
              <NumberField label="koi_depth (ppm)" value={sim.koi_depth ?? null} onChange={v => set("koi_depth", v)} min={5} max={100000} step={5} />
              <NumberField label="koi_prad (R⊕)" value={sim.koi_prad ?? null} onChange={v => set("koi_prad", v)} min={0.1} max={25} step={0.1} />
              <NumberField label="koi_model_snr" value={sim.koi_model_snr ?? null} onChange={v => set("koi_model_snr", v)} min={0} max={500} step={0.5} />
              <NumberField label="koi_ror (Rp/R★)" value={sim.koi_ror ?? null} onChange={v => set("koi_ror", v)} min={0} max={0.2} step={0.001} />
              <NumberField label="koi_impact (b)" value={sim.koi_impact ?? null} onChange={v => set("koi_impact", v)} min={0} max={1.2} step={0.01} />
              <NumberField label="koi_max_mult_ev" value={sim.koi_max_mult_ev ?? null} onChange={v => set("koi_max_mult_ev", v)} min={0} max={10} step={1} />
              <ToggleField label="koi_fpflag_ss" value={sim.koi_fpflag_ss ?? 0} onChange={v => set("koi_fpflag_ss", v)} />
              <ToggleField label="koi_fpflag_co" value={sim.koi_fpflag_co ?? 0} onChange={v => set("koi_fpflag_co", v)} />
              <ToggleField label="koi_fpflag_nt" value={sim.koi_fpflag_nt ?? 0} onChange={v => set("koi_fpflag_nt", v)} />
              <ToggleField label="koi_fpflag_ec" value={sim.koi_fpflag_ec ?? 0} onChange={v => set("koi_fpflag_ec", v)} />
            </div>

            <div className="mt-2">
              {result ? (
                <div>
                  <div className="text-white/90 text-xl">{result.prediction}</div>
                  <div className="text-white/70">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                  <p className="text-white/60 text-sm mt-2">
                    Heuristic: deeper transits (↑koi_depth), higher SNR (↑koi_model_snr), and plausible geometry (0≤b≤1) tend to push toward planet‑like classifications; flags like eclipsing binary/centroid issues push away.
                  </p>
                </div>
              ) : <div className="text-white/60">Make adjustments to see predictions.</div>}
              {busy && <div className="text-white/60 mt-1">Predicting…</div>}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
