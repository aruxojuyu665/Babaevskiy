"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

// Lazy load Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieServiceIconProps {
  /** Path to lottie JSON file in public/lottie/ */
  animationPath: string;
  /** Fallback SVG icon when Lottie file not available */
  fallback: React.ReactNode;
  className?: string;
}

export function LottieServiceIcon({ animationPath, fallback, className = "" }: LottieServiceIconProps) {
  const lottieRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load animation data on mount
  useState(() => {
    fetch(animationPath)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setAnimationData(data);
        setLoaded(true);
      })
      .catch(() => setHasError(true));
  });

  if (hasError || !loaded || !animationData) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div
      className={className}
      onMouseEnter={() => {
        lottieRef.current?.goToAndPlay(0, true);
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
