"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";

/**
 * Client-side anti-bot primitives for lead forms.
 *
 * Provides two silent signals the server uses to detect automation:
 *  - a hidden honeypot input (`website`) that real users can't see or tab into
 *  - a form-mount timestamp (`_ts`) used server-side to reject sub-2.5s submits
 *
 * No UI, no friction for real users. A single `useAntiBot()` hook returns
 * the field component and a helper that produces the values to include in the
 * submission body (JSON or FormData).
 */

const HONEYPOT_NAME = "website";
const TS_NAME = "_ts";

// Hidden from users (off-screen, no pointer events, not tab-reachable, not
// autofillable) but still present in the DOM so bots that fill every field
// will populate it.
const HONEYPOT_STYLE: CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

export interface AntiBotPayload {
  [HONEYPOT_NAME]: string;
  [TS_NAME]: number;
}

export interface UseAntiBotResult {
  /** Render inside the <form>. Invisible to real users. */
  HoneypotField: () => ReactElement;
  /** Returns `{ website, _ts }` — spread into JSON body. */
  getAntiBotPayload: () => AntiBotPayload;
  /** Appends `website` and `_ts` to an existing FormData. */
  appendAntiBotToFormData: (form: FormData) => void;
}

export function useAntiBot(): UseAntiBotResult {
  const mountedAtRef = useRef<number>(0);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    // Capture mount time once the component actually mounts on the client.
    // Running this inside render would be impure and also happens during SSR
    // (where the server's Date.now() would travel into the hydrated HTML).
    if (mountedAtRef.current === 0) mountedAtRef.current = Date.now();
  }, []);

  const HoneypotField = () => (
    <div aria-hidden="true" style={HONEYPOT_STYLE}>
      <label htmlFor={`antibot-${HONEYPOT_NAME}`}>
        Не заполняйте это поле
        <input
          id={`antibot-${HONEYPOT_NAME}`}
          type="text"
          name={HONEYPOT_NAME}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );

  const getAntiBotPayload = (): AntiBotPayload => ({
    [HONEYPOT_NAME]: honeypot,
    [TS_NAME]: mountedAtRef.current,
  });

  const appendAntiBotToFormData = (form: FormData): void => {
    form.append(HONEYPOT_NAME, honeypot);
    form.append(TS_NAME, String(mountedAtRef.current));
  };

  return { HoneypotField, getAntiBotPayload, appendAntiBotToFormData };
}
