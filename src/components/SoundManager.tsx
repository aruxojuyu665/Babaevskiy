"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  play: (sound: "click" | "reveal" | "success") => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

export function useSounds() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const howlerRef = useRef<typeof import("howler") | null>(null);
  const soundsRef = useRef<Record<string, any>>({});

  // Lazy load Howler only when enabled
  useEffect(() => {
    if (!enabled) return;

    async function loadSounds() {
      const { Howl } = await import("howler");
      howlerRef.current = await import("howler");

      // Use short, warm, low-frequency sounds
      // These are placeholder URLs — replace with actual sound files
      soundsRef.current = {
        click: new Howl({
          src: ["/sounds/click.webm", "/sounds/click.mp3"],
          volume: 0.3,
          preload: true,
        }),
        reveal: new Howl({
          src: ["/sounds/reveal.webm", "/sounds/reveal.mp3"],
          volume: 0.2,
          preload: true,
        }),
        success: new Howl({
          src: ["/sounds/success.webm", "/sounds/success.mp3"],
          volume: 0.3,
          preload: true,
        }),
      };
    }

    loadSounds();
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((prev) => !prev), []);

  const play = useCallback(
    (sound: "click" | "reveal" | "success") => {
      if (!enabled) return;
      soundsRef.current[sound]?.play();
    },
    [enabled]
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

/** Sound toggle button for footer */
export function SoundToggle() {
  const { enabled, toggle } = useSounds();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm opacity-70 transition-opacity hover:opacity-100"
      aria-label={enabled ? "Выключить звук" : "Включить звук"}
    >
      {enabled ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
      {enabled ? "Звук вкл" : "Звук"}
    </button>
  );
}
