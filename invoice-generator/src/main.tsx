import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";

// HashRouter (not BrowserRouter): this app is meant to be openable as a
// static build with no server-side rewrite rules — including straight off
// disk via file:// — and hash-based routes work everywhere without config.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
