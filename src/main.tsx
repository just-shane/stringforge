import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { init as initPlausible } from "@plausible-analytics/tracker";
import App from "./App.tsx";
import "./index.css";

// Initialize Plausible analytics
initPlausible({
  domain: "stringforge.io",
  outboundLinks: true,
  fileDownloads: true,
  formSubmissions: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
