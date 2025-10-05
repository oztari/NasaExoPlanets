import { useState } from "react";
import "./ExtraResources.css";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  github: string;
  linkedin?: string;
  description: string;
}

interface Slide {
  title: string;
  content: string;
  image?: string;
}

export default function ExtraResources() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const teamMembers: TeamMember[] = [
    {
      name: "Mahnoz Akhtari",
      role: "Machine Learning Engineer",
      avatar: "👨‍🚀",
      github: "https://github.com/oztari",
      linkedin: "https://www.linkedin.com/in/mahnoz-akhtari-65125a267/",
      description: "Led the machine learning development, training both Random Forest and Logistic Regression models. Specialized in AI model optimization and astronomical data analysis for exoplanet classification."
    },
    {
      name: "Hadiyah Arif", 
      role: "Software Engineer",
      avatar: "👩‍🚀",
      github: "https://github.com/Hadiyahh",
      linkedin: "https://hadiyah.tech/",
      description: "Versatile software engineer contributing across multiple areas of the project. Focused primarily on frontend development while supporting various aspects of the application architecture."
    },
    {
      name: "Bobola Obiwale",
      role: "Full Stack Developer",
      avatar: "👨‍💻",
      github: "https://github.com/BobolaObi",
      linkedin: "https://bobolaobi.com/",
      description: "Frontend and backend development expert. Created the interactive interface for exploring exoplanet data and predictions."
    }
  ];

  const slides: Slide[] = [
    {
      title: "🌟 Project Overview",
      content: "Our exoplanet classification system uses advanced machine learning to analyze Kepler Space Telescope data, helping researchers identify potential planets beyond our solar system."
    },
    {
      title: "🤖 Machine Learning Models",
      content: "We implemented Random Forest (91.9% accuracy) and Logistic Regression models trained on 8,054 Kepler Objects of Interest (KOI) to classify astronomical signals."
    },
    {
      title: "🔬 Data Sources",
      content: "Our dataset includes comprehensive parameters like orbital period, transit duration, signal depth, planet radius, and various quality flags from NASA's Kepler mission."
    },
    {
      title: "🚀 NASA Space Apps Challenge",
      content: "This project was developed for the 2025 NASA Space Apps Challenge, demonstrating the power of citizen science and open data in space exploration."
    },
    {
      title: "🌌 Impact & Future",
      content: "Our tool helps democratize exoplanet research, making advanced analysis accessible to educators, students, and astronomy enthusiasts worldwide."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1 className="resources-title">📚 Extra Resources</h1>
        <p className="resources-subtitle">Meet the Team & Learn More</p>
      </div>

      <div className="resources-content">
        {/* Team Section */}
        <section className="team-section">
          <h2 className="section-title">👥 Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">{member.avatar}</div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
                <div className="team-links">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="team-link">
                    🐙 GitHub
                  </a>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-link">
                      💼 Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Slideshow Section */}
        <section className="slideshow-section">
          <h2 className="section-title">🎯 Project Journey</h2>
          <div className="slideshow-container">
            <div className="slide-wrapper">
              <div className="slide">
                <h3 className="slide-title">{slides[currentSlide].title}</h3>
                <p className="slide-content">{slides[currentSlide].content}</p>
              </div>
            </div>
            
            <div className="slide-controls">
              <button onClick={prevSlide} className="slide-btn">⬅️ Previous</button>
              <div className="slide-indicators">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`slide-indicator ${index === currentSlide ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button onClick={nextSlide} className="slide-btn">Next ➡️</button>
            </div>
          </div>
        </section>

        {/* Repository & Resources Section */}
        <section className="resources-links-section">
          <h2 className="section-title">🔗 Project Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-icon">🐙</div>
              <h3>GitHub Repository</h3>
              <p>Explore our complete source code, models, and documentation</p>
              <a 
                href="https://github.com/oztari/NasaExoPlanets" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resource-button"
              >
                View Repository
              </a>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">📊</div>
              <h3>Dataset</h3>
              <p>NASA Kepler mission data with 8,054+ confirmed and candidate exoplanets</p>
              <a 
                href="https://exoplanetarchive.ipac.caltech.edu/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resource-button"
              >
                NASA Archive
              </a>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">🚀</div>
              <h3>NASA Space Apps</h3>
              <p>Learn more about the global hackathon that inspired this project</p>
              <a 
                href="https://www.spaceappschallenge.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resource-button"
              >
                Visit Space Apps
              </a>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">🔬</div>
              <h3>Kepler Mission</h3>
              <p>Discover more about NASA's planet-hunting space telescope</p>
              <a 
                href="https://www.nasa.gov/kepler" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resource-button"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Fun Facts Section */}
        <section className="fun-facts-section">
          <h2 className="section-title">🌟 Fun Facts</h2>
          <div className="facts-grid">
            <div className="fact-card">
              <div className="fact-emoji">🌍</div>
              <h4>Earth-like Planets</h4>
              <p>Kepler discovered planets in the "habitable zone" where liquid water could exist</p>
            </div>
            <div className="fact-card">
              <div className="fact-emoji">⏱️</div>
              <h4>Transit Method</h4>
              <p>Planets are detected by the tiny dimming of starlight as they pass in front of their star</p>
            </div>
            <div className="fact-card">
              <div className="fact-emoji">🔢</div>
              <h4>Data Scale</h4>
              <p>Kepler monitored over 150,000 stars simultaneously for nearly a decade</p>
            </div>
            <div className="fact-card">
              <div className="fact-emoji">🎯</div>
              <h4>Precision</h4>
              <p>Our ML model can detect exoplanet signals with 91.9% accuracy</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}