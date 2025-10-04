import './App.css'

function App() {

  return (
    <>
         <div className="hero">
      <nav>
        <a href="https://github.com/oztari/Nasa-Exoplanet-Detector" target="_blank" rel="noreferrer">
          #Analysis Github
        </a>
        <a href="https://github.com/Hadiyahh/exoplanet-app" target="_blank" rel="noreferrer">
          #Design Github
        </a>
      </nav>

      <h1>
        A World Away<span>🚀</span>
      </h1>
      <h2>Hunting for Exoplanets with AI</h2>
      <p>With Artificial Intelligence and Machine Learning</p>

      <div className="btn-container">
        <button
          className="btn"
          onClick={() => alert("Get ready to start your space journey!")}
        >
          For Researchers
        </button>
        <button
          className="btn"
          onClick={() => alert("Welcome, Enthusiast! 🚀")}
        >
          For Enthusiasts
        </button>
      </div>

      <footer>2025 NASA Space Apps Challenge</footer>
    </div>
    </>
  )
}

export default App
