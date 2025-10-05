import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="hero">
      <h1>
        A World Away<span>🚀</span>
      </h1>
      <h2>Hunting for Exoplanets with AI</h2>
      <p>With Artificial Intelligence and Machine Learning</p>

      <div className="btn-container">
        <Link to="/researcher" className="btn">For Researchers</Link>
        <Link to="/explorer" className="btn">For Enthusiasts</Link>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <h3>8,054</h3><p>KOI Objects</p>
        </div>
        <div className="stat">
          <h3>91.9%</h3><p>Accuracy</p>
        </div>
        <div className="stat">
          <h3>2,600+</h3><p>Confirmed Planets</p>
        </div>
      </div>

      <footer>2025 NASA Space Apps Challenge</footer>
    </div>
  );
};

export default Home;
