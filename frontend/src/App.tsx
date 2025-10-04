import "./App.css";
import { useNavigate, Routes, Route } from "react-router-dom";
import Explorer from "./pages/Explorer";
import Researcher from "./pages/Researcher";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="hero">
              <nav>
                <a
                  href="https://github.com/oztari/Nasa-Exoplanet-Detector"
                  target="_blank"
                  rel="noreferrer"
                >
                  #Analysis Github
                </a>
                <a
                  href="https://github.com/Hadiyahh/exoplanet-app"
                  target="_blank"
                  rel="noreferrer"
                >
                  #Design Github
                </a>
              </nav>

              <h1>
                A World Away<span>🚀</span>
              </h1>
              <h2>Hunting for Exoplanets with AI</h2>
              <p>With Artificial Intelligence and Machine Learning</p>

              <div className="btn-container">
                <button className="btn" onClick={() => navigate("/researcher")}>
                  For Researchers
                </button>
                <button
                  className="btn"
                  onClick={() => navigate("/explorer")}
                >
                  For Enthusiasts
                </button>
              </div>

              <footer>2025 NASA Space Apps Challenge</footer>
            </div>
          }
        />
        <Route path="/researcher" element={<Researcher />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </>
  );
}

export default App;