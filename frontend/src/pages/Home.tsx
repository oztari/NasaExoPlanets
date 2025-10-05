import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="hero">
      <h1>
        A World Away<span>🚀</span>
      </h1>
      <h2>Hunting for Exoplanets with AI</h2>
      <p>With Artificial Intelligence and Machine Learning</p>

      <div className="btn-container">
        <Link to="/project-structure" className="btn">
          For Researchers
        </Link>
        <Link to="/about-exoplanets" className="btn">
          For Enthusiasts
        </Link>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <h3>8,054</h3>
          <p>KOI Objects</p>
        </div>
        <div className="stat">
          <h3>91.9%</h3>
          <p>Accuracy</p>
        </div>
        <div className="stat">
          <h3>2,600+</h3>
          <p>Confirmed Planets</p>
        </div>
      </div>

      <footer>2025 NASA Space Apps Challenge</footer>
    </div>
  );
};

export default Home;

// export default function Home() {
//   return (
//     <div className="grid md:grid-cols-2 gap-6">
//       <section className="card">
//         <h1 className="title">Welcome 🚀</h1>
//         <p className="subtitle mt-2">
//           This interface connects to your FastAPI model serving endpoint to predict whether a Kepler KOI is a Candidate, Confirmed, or False Positive.
//         </p>
//         <ul className="mt-4 list-disc list-inside text-white/80">
//           <li><b>Researcher Dashboard</b> — paste or tweak feature values and get predictions with confidence.</li>
//           <li><b>User Dashboard</b> — browse KOIs, read non‑technical explanations, and simulate feature changes.</li>
//         </ul>
//       </section>

//       <section className="card">
//         <h2 className="text-xl font-semibold">Quick Start</h2>
//         <ol className="mt-2 space-y-2 text-white/80 list-decimal list-inside">
//           <li>Run your FastAPI server at <code>http://localhost:8000</code>.</li>
//           <li>Open the Researcher Dashboard and try a sample payload.</li>
//           <li>Explore KOIs in the User Dashboard and use the Simulate panel.</li>
//         </ol>
//       </section>
//     </div>
//   )
// }
