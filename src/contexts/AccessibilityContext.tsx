import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AccessibilityState {
  fontSize: number; // 0 = normal, 1 = large, 2 = extra-large
  highContrast: boolean;
  reducedMotion: boolean;
  enabled: boolean; // master toggle
  librasActive: boolean;
  focusMode: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleEnabled: () => void;
  toggleLibras: () => void;
  toggleFocusMode: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const STORAGE_KEY = "bookquest-accessibility";

const defaults: AccessibilityState = {
  fontSize: 0,
  highContrast: false,
  reducedMotion: false,
  enabled: true,
  librasActive: false,
  focusMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply font size to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (!state.enabled) {
      root.style.fontSize = "100%";
      return;
    }
    const sizes = ["100%", "112.5%", "125%"];
    root.style.fontSize = sizes[state.fontSize] || "100%";
  }, [state.fontSize, state.enabled]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", state.enabled && state.highContrast);
  }, [state.highContrast, state.enabled]);

  // Apply reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", state.enabled && (state.reducedMotion || state.focusMode));
  }, [state.reducedMotion, state.enabled, state.focusMode]);

  // Apply focus mode
  useEffect(() => {
    document.documentElement.classList.toggle("focus-mode", state.enabled && state.focusMode);
  }, [state.focusMode, state.enabled]);

  // Load VLibras when libras is active
  useEffect(() => {
    if (!state.enabled || !state.librasActive) {
      // Remove VLibras widget if present
      const widget = document.querySelector("[vw]");
      if (widget) widget.classList.add("hidden");
      return;
    }

    const widget = document.querySelector("[vw]");
    if (widget) {
      widget.classList.remove("hidden");
      return;
    }

    // Inject VLibras script
    const wrapper = document.createElement("div");
    wrapper.setAttribute("vw", "");
    wrapper.classList.add("enabled");

    const accessBar = document.createElement("div");
    accessBar.setAttribute("vw-access-button", "");
    accessBar.classList.add("active");

    const pluginWrapper = document.createElement("div");
    pluginWrapper.setAttribute("vw-plugin-wrapper", "");

    const topWrapper = document.createElement("div");
    topWrapper.classList.add("vw-plugin-top-wrapper");
    pluginWrapper.appendChild(topWrapper);

    wrapper.appendChild(accessBar);
    wrapper.appendChild(pluginWrapper);
    document.body.appendChild(wrapper);

    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.onload = () => {
      // @ts-ignore
      new window.VLibras.Widget("https://vlibras.gov.br/app");
    };
    document.head.appendChild(script);
  }, [state.librasActive, state.enabled]);

  const increaseFontSize = useCallback(() => {
    setState((s) => ({ ...s, fontSize: Math.min(s.fontSize + 1, 2) }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setState((s) => ({ ...s, fontSize: Math.max(s.fontSize - 1, 0) }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setState((s) => ({ ...s, highContrast: !s.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setState((s) => ({ ...s, reducedMotion: !s.reducedMotion }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setState((s) => ({ ...s, enabled: !s.enabled }));
  }, []);

  const toggleLibras = useCallback(() => {
    setState((s) => ({ ...s, librasActive: !s.librasActive }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setState((s) => ({ ...s, focusMode: !s.focusMode }));
  }, []);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...state,
        increaseFontSize,
        decreaseFontSize,
        toggleHighContrast,
        toggleReducedMotion,
        toggleEnabled,
        toggleLibras,
        toggleFocusMode,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
