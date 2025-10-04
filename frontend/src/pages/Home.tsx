export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card">
        <h1 className="title">Welcome 🚀</h1>
        <p className="subtitle mt-2">
          This interface connects to your FastAPI model serving endpoint to predict whether a Kepler KOI is a Candidate, Confirmed, or False Positive.
        </p>
        <ul className="mt-4 list-disc list-inside text-white/80">
          <li><b>Researcher Dashboard</b> — paste or tweak feature values and get predictions with confidence.</li>
          <li><b>User Dashboard</b> — browse KOIs, read non‑technical explanations, and simulate feature changes.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Quick Start</h2>
        <ol className="mt-2 space-y-2 text-white/80 list-decimal list-inside">
          <li>Run your FastAPI server at <code>http://localhost:8000</code>.</li>
          <li>Open the Researcher Dashboard and try a sample payload.</li>
          <li>Explore KOIs in the User Dashboard and use the Simulate panel.</li>
        </ol>
      </section>
    </div>
  )
}
