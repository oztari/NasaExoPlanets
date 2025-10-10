// The central router + layout of the frontend:
// Always shows the Navigation bar.
// Switches between different pages based on the URL.
// Acts as the skeleton of the SPA (Single Page Application).
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// Informational pages
import Home from "./pages/Home";
import AboutExoplanets from "./pages/AboutExoplanets";
import ProjectStructure from "./pages/ProjectStructure";
import ExtraResources from "./pages/ExtraResources";

// Interactive pages with user features
import Researcher from "./pages/Researcher";
import Explorer from "./pages/Explorer";

function App() {
  return (
    <div className="app">
      {/* the navbar will be visible in every page */}
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-exoplanets" element={<AboutExoplanets />} />
        <Route path="/project-structure" element={<ProjectStructure />} />
        <Route path="/researcher" element={<Researcher />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/extra-resources" element={<ExtraResources />} />
      </Routes>
    </div>
  );
}

export default App;
