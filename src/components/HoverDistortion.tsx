"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useIsDesktop } from "@/lib/animations";

interface HoverDistortionProps {
  image1: string;
  image2: string;
  displacementImage: string;
  className?: string;
  sizes?: string;
}

export function HoverDistortion({
  image1,
  image2,
  displacementImage,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: HoverDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();

  useEffect(() => {
    if (!desktop || !containerRef.current) return;

    async function init() {
      const HoverEffect = (await import("hover-effect")).default;
      if (!containerRef.current) return;
      new HoverEffect({
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
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        canvas?.remove();
      }
    };
  }, [desktop, image1, image2, displacementImage]);

  if (!desktop) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={image1}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
