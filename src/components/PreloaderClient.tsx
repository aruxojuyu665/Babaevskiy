"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Gate the Preloader on desktop only. This does two things:
 *  (1) Never renders on mobile — saves LCP + avoids click-intercept races
 *      during lazy component mount in tests.
 *  (2) Dynamic-imports the heavy GSAP/SVG path code, so the chunk is only
 *      fetched when eligible (desktop with fine pointer). Mobile never
 *      downloads it.
 */
const Preloader = dynamic(
  () => import("./Preloader").then((m) => ({ default: m.Preloader })),
  { ssr: false, loading: () => null }
);

export function PreloaderClient() {
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const mobileUa = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!coarse && !narrow && !mobileUa) setEligible(true);
  }, []);
  if (!eligible) return null;
  return <Preloader />;
}
