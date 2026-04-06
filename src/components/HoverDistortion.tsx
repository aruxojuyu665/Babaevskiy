"use client";

import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/lib/animations";

interface HoverDistortionProps {
  image1: string;
  image2: string;
  displacementImage: string;
  className?: string;
}

export function HoverDistortion({
  image1,
  image2,
  displacementImage,
  className = "",
}: HoverDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();

  useEffect(() => {
    if (!desktop || !containerRef.current) return;

    let hoverEffect: any;

    async function init() {
      const HoverEffect = (await import("hover-effect")).default;

      if (!containerRef.current) return;
      hoverEffect = new HoverEffect({
        parent: containerRef.current,
        intensity: 0.2,
        image1,
        image2,
        displacementImage,
        speedIn: 1.5,
        speedOut: 1.5,
        hover: true,
        easing: "power2.out",
      });
    }

    init();

    return () => {
      // hover-effect doesn't have a destroy method, remove canvas
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        canvas?.remove();
      }
    };
  }, [desktop, image1, image2, displacementImage]);

  if (!desktop) {
    return (
      <div className={className}>
        <img src={image1} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
