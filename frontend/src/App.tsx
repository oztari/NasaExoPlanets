import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// Your pages
import Home from "./pages/Home";
import AboutExoplanets from "./pages/AboutExoplanets";
import ProjectStructure from "./pages/ProjectStructure";

// Team pages
import Researcher from "./pages/Researcher";
import Explorer from "./pages/Explorer";

function App() {
  return (
    <div className="app">
      {/* your top bar visible everywhere */}
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-exoplanets" element={<AboutExoplanets />} />
        <Route path="/project-structure" element={<ProjectStructure />} />
        <Route path="/researcher" element={<Researcher />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </div>
  );
}

export default App;
