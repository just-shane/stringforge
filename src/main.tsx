import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { init as initPlausible } from "@plausible-analytics/tracker";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry error monitoring
Sentry.init({
  dsn: "https://37e9f217609d1dc8e97291a1a985e608@o4511070700306432.ingest.us.sentry.io/4511079449493504",
  sendDefaultPii: true,
  enabled: import.meta.env.PROD,
});

// Initialize Plausible analytics
initPlausible({
  domain: "stringforge.io",
  outboundLinks: true,
  fileDownloads: true,
  formSubmissions: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p className="p-8 text-center text-red-400">Something went wrong. Please refresh the page.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
