import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Handle Vite preload errors by reloading the page
// This fixes "Failed to fetch dynamically imported module" errors
window.addEventListener('vite:preloadError', (event) => {
  console.log('Vite preload error detected, reloading page...', event);
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
