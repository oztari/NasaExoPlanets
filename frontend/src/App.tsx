import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// Our pages
import Home from "./pages/Home";
import AboutExoplanets from "./pages/AboutExoplanets";
import ProjectStructure from "./pages/ProjectStructure";
import ExtraResources from "./pages/ExtraResources";

// Team pages
import Researcher from "./pages/Researcher";
import Explorer from "./pages/Explorer";

function App() {
  return (
    <div className="app">
      {/* our top bar will be visible in every page */}
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
