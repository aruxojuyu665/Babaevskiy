"use client";

import { useEffect, useState, useRef } from "react";

// Thread path — wavy stitch line
const THREAD_PATH = "M 20 20 C 55 4, 85 36, 120 20 C 155 4, 185 36, 220 20 C 245 10, 265 20, 280 20";

// Stitch positions (parameter t along path where stitches appear)
const STITCH_POSITIONS = [0.28, 0.5, 0.72];

const SESSION_KEY = "babaevskaya:preloader-seen";

interface Point {
  x: number;
  y: number;
  angle: number;
}

function getPointOnPath(path: SVGPathElement, t: number): Point {
  const len = path.getTotalLength();
  const pos = t * len;
  const pt = path.getPointAtLength(pos);

  // Calculate tangent angle from nearby points
  const delta = 0.5;
  const ptBefore = path.getPointAtLength(Math.max(0, pos - delta));
  const ptAfter = path.getPointAtLength(Math.min(len, pos + delta));
  const angle = Math.atan2(ptAfter.y - ptBefore.y, ptAfter.x - ptBefore.x) * (180 / Math.PI);

  return { x: pt.x, y: pt.y, angle };
}

export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const stitchesRef = useRef<Point[]>([]);
  const [pathReady, setPathReady] = useState(false);
  const [shortRun, setShortRun] = useState(false);

  // Wait for SVG path to mount + decide how long the preloader should run.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = window.sessionStorage.getItem(SESSION_KEY);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.matchMedia("(max-width: 768px)").matches;
      const mobileUa = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      // Skip entirely when: already seen this session, reduced-motion preference,
      // touch/mobile pointer, narrow viewport, or a mobile UA. The preloader is
      // purely decorative, and it would otherwise gate LCP on mobile.
      if (seen || reduced || coarse || narrow || mobileUa) {
        setPhase("done");
        return;
      }
      setShortRun(false);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }
    if (pathRef.current) {
      const path = pathRef.current;
      stitchesRef.current = STITCH_POSITIONS.map((t) => getPointOnPath(path, t));
      setPathReady(true);
    }
  }, []);

  // Animate progress via rAF — only one setState per frame
  useEffect(() => {
    if (!pathReady || phase === "done") return;

    const duration = shortRun ? 900 : 2400;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("reveal");
        setTimeout(() => setPhase("done"), 600);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pathReady]);

  // Derive needle and stitch visibility from progress — no extra state updates
  const needle: Point = pathRef.current && pathReady
    ? getPointOnPath(pathRef.current, progress)
    : { x: 20, y: 20, angle: 0 };

  const stitches = stitchesRef.current;
  const visibleStitches = STITCH_POSITIONS.map((t) => progress > t + 0.03);

  const pathLength = pathRef.current?.getTotalLength() ?? 320;

  if (phase === "done") return null;

  return (
    <div
      className="preloader-root fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg-primary)]"
      style={{
        opacity: phase === "reveal" ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: phase === "reveal" ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center">
        {/* Thread + needle SVG */}
        <div className="mb-10 w-64 md:w-80">
          <svg viewBox="0 0 300 40" fill="none" className="w-full overflow-visible">
            {/* Hidden path for measurement */}
            <path
              ref={pathRef}
              d={THREAD_PATH}
              stroke="transparent"
              fill="none"
            />

            {/* Visible thread — draws behind the needle */}
            <path
              d={THREAD_PATH}
              stroke="#C4956A"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength - progress * pathLength}
            />

            {/* Stitch marks — diagonal lines that appear after needle passes */}
            {stitches.map((st, i) => (
              <g
                key={i}
                opacity={visibleStitches[i] ? 1 : 0}
                style={{ transition: "opacity 0.3s ease" }}
              >
                <line
                  x1={st.x - 3}
                  y1={st.y - 6}
                  x2={st.x + 3}
                  y2={st.y + 6}
                  stroke="#8B6544"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Needle — realistic sewing needle shape */}
            <g
              transform={`translate(${needle.x}, ${needle.y}) rotate(${needle.angle})`}
              style={{ transition: "none" }}
            >
              {/* Needle shaft — long thin metallic body */}
              <line x1="-12" y1="0" x2="16" y2="0" stroke="#A0937D" strokeWidth="2" strokeLinecap="round" />
              {/* Needle highlight — metallic shine along shaft */}
              <line x1="-10" y1="-0.6" x2="14" y2="-0.6" stroke="#C8BCAB" strokeWidth="0.5" opacity="0.6" />
              {/* Sharp tip */}
              <polygon points="16,-1 22,0 16,1" fill="#8C8070" />
              {/* Eye — oval hole near the back end */}
              <ellipse cx="-8" cy="0" rx="1.8" ry="1.2" fill="var(--bg-primary)" stroke="#8C8070" strokeWidth="0.8" />
              {/* Thread coming out of the eye */}
              <line x1="-10" y1="0" x2="-14" y2="1" stroke="#C4956A" strokeWidth="1" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Brand name */}
        <h1
          className="font-serif text-4xl font-bold text-[var(--text-primary)] md:text-5xl"
          style={{
            opacity: progress > 0.25 ? 1 : 0,
            transform: progress > 0.25 ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.7s ease",
          }}
        >
          Бабаевская
        </h1>
        <p
          className="mt-2 text-sm tracking-[0.3em] uppercase text-[var(--text-muted)]"
          style={{
            opacity: progress > 0.45 ? 1 : 0,
            transform: progress > 0.45 ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.7s ease 0.15s",
          }}
        >
          мастерская
        </p>

        {/* Progress bar */}
        <div className="mt-10 h-[2px] w-40 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }}
          />
        </div>
      </div>
    </div>
  );
}
