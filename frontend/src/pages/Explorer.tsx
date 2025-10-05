import { useEffect, useMemo, useRef, useState } from "react";
import { fmt, listKoi, predict } from "../lib/api";
import { type KOIItem, type PredictPayload, } from "../lib/types";
import NumberField from "../components/NumberField";
import ToggleField from "../components/ToggleField";
import "./Explorer.css";

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
    // const out = await predict(sim, "rf")
    const out = await predict(sim, "lr")

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
    <div className="explorer-container">
      <div className="explorer-header">
        <h1 className="explorer-title">🔭 KOI Explorer</h1>
        <p className="explorer-subtitle">Discover & Analyze Kepler Objects of Interest</p>
      </div>

      <div className="explorer-grid">
        <section className="explorer-card">
          <h2>🌌 KOI Browser</h2>
          <input 
            className="search-input" 
            placeholder="🔍 Search by KepID or KOI name..." 
            value={q} 
            onChange={e => setQ(e.target.value)} 
          />
          <div className="koi-list">
            {filtered.slice(0, 200).map(row => (
              <button
                key={row.kepid}
                onClick={() => { setSel(row); setSim(pickPayload(row)); setResult(null) }}
                className={`koi-item ${sel?.kepid === row.kepid ? "selected" : ""}`}
              >
                <div className="koi-item-name">{row.kepoi_name ?? `KepID ${row.kepid}`}</div>
                <div className="koi-item-disposition">Disposition: {row.koi_disposition ?? "—"}</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="no-data">No matches found.</div>}
          </div>
        </section>

        <section className="explorer-card">
          <h3>📊 Object Summary</h3>
          {!sel ? <div className="no-data">Select a KOI to view details</div> : (
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {sel.kepoi_name ?? `KepID ${sel.kepid}`}</div>
                <div style={{ marginBottom: '1rem' }}><strong>Archive Status:</strong> {sel.koi_disposition ?? "—"}</div>
              </div>
              <div className="control-description">
                This tool uses machine learning to predict whether the signal indicates a transiting exoplanet. 
                It's an analytical aid, not a formal confirmation.
              </div>
              <div className="parameter-grid">
                <div className="parameter-card">
                  <div className="parameter-label">Period</div>
                  <div className="parameter-value">{fmt(sel.koi_period)} d</div>
                </div>
                <div className="parameter-card">
                  <div className="parameter-label">Duration</div>
                  <div className="parameter-value">{fmt(sel.koi_duration)} h</div>
                </div>
                <div className="parameter-card">
                  <div className="parameter-label">Depth</div>
                  <div className="parameter-value">{fmt(sel.koi_depth)} ppm</div>
                </div>
                <div className="parameter-card">
                  <div className="parameter-label">Radius</div>
                  <div className="parameter-value">{fmt(sel.koi_prad)} R⊕</div>
                </div>
                <div className="parameter-card">
                  <div className="parameter-label">SNR</div>
                  <div className="parameter-value">{fmt(sel.koi_model_snr)}</div>
                </div>
                <div className="parameter-card">
                  <div className="parameter-label">Impact (b)</div>
                  <div className="parameter-value">{fmt(sel.koi_impact)}</div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="explorer-card">
          <h3>⚙️ Interactive Simulation</h3>
          {!sim ? <div className="no-data">Select a KOI to begin simulation</div> : (
            <div>
              <div className="control-description">
                🎛️ Adjust parameters below to see how changes affect the ML prediction. 
                This simulates "what-if" scenarios without changing archive values.
              </div>
              <div className="simulation-controls">
                <NumberField label="🪐 Period (days)" value={sim.koi_period ?? null} onChange={v => set("koi_period", v)} min={0.05} max={1000} step={0.05} />
                <NumberField label="⏱️ Duration (hours)" value={sim.koi_duration ?? null} onChange={v => set("koi_duration", v)} min={0.05} max={30} step={0.05} />
                <NumberField label="📉 Depth (ppm)" value={sim.koi_depth ?? null} onChange={v => set("koi_depth", v)} min={5} max={100000} step={5} />
                <NumberField label="📏 Radius (R⊕)" value={sim.koi_prad ?? null} onChange={v => set("koi_prad", v)} min={0.1} max={25} step={0.1} />
                <NumberField label="📶 Model SNR" value={sim.koi_model_snr ?? null} onChange={v => set("koi_model_snr", v)} min={0} max={500} step={0.5} />
                <NumberField label="📐 Radius Ratio" value={sim.koi_ror ?? null} onChange={v => set("koi_ror", v)} min={0} max={0.2} step={0.001} />
                <NumberField label="🎯 Impact Parameter" value={sim.koi_impact ?? null} onChange={v => set("koi_impact", v)} min={0} max={1.2} step={0.01} />
                <NumberField label="🔢 Max Multiple Events" value={sim.koi_max_mult_ev ?? null} onChange={v => set("koi_max_mult_ev", v)} min={0} max={10} step={1} />
                <ToggleField label="🚩 Stellar Eclipse Flag" value={sim.koi_fpflag_ss ?? 0} onChange={v => set("koi_fpflag_ss", v)} />
                <ToggleField label="🚩 Centroid Offset Flag" value={sim.koi_fpflag_co ?? 0} onChange={v => set("koi_fpflag_co", v)} />
                <ToggleField label="🚩 Not Transit-like Flag" value={sim.koi_fpflag_nt ?? 0} onChange={v => set("koi_fpflag_nt", v)} />
                <ToggleField label="🚩 Ephemeris Match Flag" value={sim.koi_fpflag_ec ?? 0} onChange={v => set("koi_fpflag_ec", v)} />
              </div>

              <div className="prediction-result">
                {result ? (
                  <>
                    <div className="prediction-text">🎯 {result.prediction}</div>
                    <div className="confidence-text">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                    <p className="prediction-heuristic">
                      💡 Heuristic: Deeper transits (↑depth), higher SNR (↑signal strength), and plausible geometry (0≤impact≤1) 
                      tend toward planet classifications. Warning flags like eclipsing binaries push toward false positives.
                    </p>
                  </>
                ) : (
                  <div className="no-data">Adjust parameters above to see ML predictions</div>
                )}
                {busy && <div className="loading-indicator">🔄 Generating prediction...</div>}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
