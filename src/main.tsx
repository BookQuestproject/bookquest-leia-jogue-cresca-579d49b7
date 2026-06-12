import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the HTML initial loader once the React tree is about to mount.
// Without this, on F5 of deep routes users would see a blank white page for
// several seconds while the bundle parses; now they see the BookQuest spinner.
const rootEl = document.getElementById("root")!;
const initialLoader = document.getElementById("bq-initial-loader");
if (initialLoader) initialLoader.remove();

createRoot(rootEl).render(<App />);
