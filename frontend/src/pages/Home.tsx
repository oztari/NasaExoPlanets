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

      {/* primary CTAs follow the team's format */}
      <div className="btn-container">
        <Link to="/researcher" className="btn">For Researchers</Link>
        <Link to="/explorer" className="btn">For Enthusiasts</Link>
      </div>

      {/* keep your stats */}
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

      {/* secondary links so your pages remain discoverable */}
      <div className="quick-links">
        <Link to="/project-structure" className="link">Project Structure →</Link>
        <Link to="/about-exoplanets" className="link">About Exoplanets →</Link>
      </div>

      <footer>2025 NASA Space Apps Challenge</footer>
    </div>
  );
};

export default Home;
