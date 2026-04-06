"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollVideoPlayerProps {
  frameCount: number;
  framesPath: string;
}

export function ScrollVideoPlayer({
  frameCount,
  framesPath,
}: ScrollVideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // Preload all frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `${framesPath}/frame-${num}.jpg`;
      img.onload = () => {
        loadedCount++;
        setLoaded(loadedCount);
        if (loadedCount === frameCount) {
          setReady(true);
        }
      };
      images.push(img);
    }

    imagesRef.current = images;
  }, [frameCount, framesPath]);

  // Draw first frame once ready
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[0];
    if (!canvas || !ctx || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, [ready]);

  // GSAP ScrollTrigger: scrub frame index
  useEffect(() => {
    if (!ready) return;

    let cleanup: (() => void) | undefined;

    async function setup() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const frameObj = { frame: 0 };

      const tween = gsap.to(frameObj, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
        onUpdate: () => {
          const idx = Math.round(frameObj.frame);
          const img = imagesRef.current[idx];
          if (img && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
        },
      });

      cleanup = () => {
        tween.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    setup();
    return () => cleanup?.();
  }, [ready, frameCount]);

  const progress = frameCount > 0 ? Math.round((loaded / frameCount) * 100) : 0;

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[var(--text-primary)]">
        {/* Loading indicator */}
        {!ready && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--text-primary)]">
            <div className="mb-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-white/50">
              Загрузка {progress}%
            </p>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain"
          style={{ opacity: ready ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
