// The bootstrapper of the React app.
// Loads React.
// Sets up routing.
// Mounts App.tsx into the HTML root.
// Wraps in StrictMode for dev safety.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);