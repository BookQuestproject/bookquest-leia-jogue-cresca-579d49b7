import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bookquest-rybena-enabled";
const SCRIPT_ID = "rybena-accessibility-script";
const SCRIPT_SRC = "https://cdn.rybena.com.br/dom/master/latest/rybena.js?position=right&positionBar=right";

function loadRybena() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.type = "text/javascript";
  script.src = SCRIPT_SRC;
  document.head.appendChild(script);
}

function unloadRybena() {
  const script = document.getElementById(SCRIPT_ID);
  if (script) script.remove();

  // Remove Rybená injected elements
  document.querySelectorAll('[id^="rybena"], .rybena, [class*="rybena"]').forEach((el) => el.remove());
}

export function useRybena() {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });

  useEffect(() => {
    if (enabled) {
      loadRybena();
    } else {
      unloadRybena();
    }
  }, [enabled]);

  const toggle = useCallback((value: boolean) => {
    setEnabled(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    if (!value) {
      unloadRybena();
    }
  }, []);

  return { enabled, toggle };
}
