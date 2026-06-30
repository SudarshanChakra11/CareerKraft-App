import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { processQueue } from './services/syncService';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Process any pending sync actions after app startup (e.g., saved offline)
processQueue().catch(() => {});

// Retry when network returns
window.addEventListener('online', () => {
  processQueue().catch(() => {});
});