import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto-load Rybená if previously enabled by user
if (localStorage.getItem("bookquest-rybena-enabled") === "true") {
  const script = document.createElement("script");
  script.id = "rybena-accessibility-script";
  script.type = "text/javascript";
  script.src = "https://cdn.rybena.com.br/dom/master/latest/rybena.js?position=right&positionBar=right";
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
