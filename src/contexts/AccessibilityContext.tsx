import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AccessibilityState {
  fontSize: number; // 0 = normal, 1 = large, 2 = extra-large
  highContrast: boolean;
  reducedMotion: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const STORAGE_KEY = "bookquest-accessibility";

const defaults: AccessibilityState = {
  fontSize: 0,
  highContrast: false,
  reducedMotion: false,
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
    const sizes = ["100%", "112.5%", "125%"];
    root.style.fontSize = sizes[state.fontSize] || "100%";
  }, [state.fontSize]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", state.highContrast);
  }, [state.highContrast]);

  // Apply reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", state.reducedMotion);
  }, [state.reducedMotion]);

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
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
