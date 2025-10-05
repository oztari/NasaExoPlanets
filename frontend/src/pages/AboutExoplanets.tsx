import './AboutExoplanets.css';

const AboutExoplanets = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <header className="page-header">
          <h1>About Exoplanets</h1>
          <p className="page-subtitle">Discovering worlds beyond our solar system</p>
        </header>

        <section className="content-section">
          <h2>What are Exoplanets?</h2>
          <p>
            Exoplanets, or extrasolar planets, are planets that orbit stars outside our solar system. 
            These distant worlds come in many sizes and compositions, from rocky super-Earths to massive 
            gas giants, and they orbit their host stars at various distances.
          </p>
        </section>

        <section className="content-section">
          <h2>Why Study Exoplanets?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🌍 Search for Life</h3>
              <p>Finding potentially habitable worlds that could support life as we know it.</p>
            </div>
            <div className="feature-card">
              <h3>🔬 Understanding Formation</h3>
              <p>Learning how planetary systems form and evolve throughout the universe.</p>
            </div>
            <div className="feature-card">
              <h3>🌌 Cosmic Perspective</h3>
              <p>Gaining insights into our place in the universe and the prevalence of planetary systems.</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>How We Detect Exoplanets</h2>
          <div className="detection-methods">
            <div className="method-card">
                <h3>
                <a
                  href="https://svs.gsfc.nasa.gov/13022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="method-link"
                >
                  Transit Method
                </a>
                </h3>
              <p>
                We observe the slight dimming of a star's light when a planet passes in front of it. 
                This method was used by the Kepler Space Telescope to discover thousands of exoplanets.
              </p>
              <div className="method-stats">
                <span>Most successful method</span>
                <span>Used in our project</span>
              </div>
            </div>
            
            <div className="method-card">
              <h3>Radial Velocity</h3>
              <p>
                We detect the wobble of a star caused by the gravitational pull of an orbiting planet. 
                This method can determine a planet's mass and orbital characteristics.
              </p>
            </div>

            <div className="method-card">
              <h3>Direct Imaging</h3>
              <p>
                We directly photograph exoplanets by blocking out the light from their host star. 
                This method works best for large planets far from their stars.
              </p>
            </div>

            <div className="method-card">
              <h3>Gravitational Microlensing</h3>
              <p>
                We use the gravitational field of a planet and its star as a lens to magnify 
                light from a more distant star, revealing the planet's presence.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>The Kepler Mission</h2>
          <p>
            The Kepler Space Telescope revolutionized exoplanet science by continuously monitoring 
            over 150,000 stars for nearly a decade. Using the transit method, Kepler discovered 
            more than 2,600 confirmed exoplanets and identified thousands more candidates.
          </p>
          <div className="kepler-stats">
            <div className="stat">
              <h4>2,600+</h4>
              <p>Confirmed Exoplanets</p>
            </div>
            <div className="stat">
              <h4>4,000+</h4>
              <p>Planet Candidates</p>
            </div>
            <div className="stat">
              <h4>150,000+</h4>
              <p>Stars Monitored</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Our Role in Exoplanet Discovery</h2>
          <p>
            This project uses machine learning to analyze Kepler data and help distinguish between 
            real exoplanet signals and false positives. By training AI models on thousands of 
            known examples, we can automate the detection process and help astronomers focus on 
            the most promising candidates for further study.
          </p>
          <div className="project-highlight">
            <h3>Machine Learning + Astronomy = Discovery</h3>
            <p>
              Our AI models achieve over 91% accuracy in classifying exoplanet candidates, 
              helping to accelerate the pace of discovery and reduce manual review time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutExoplanets;