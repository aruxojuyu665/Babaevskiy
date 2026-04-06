"use client";

import { useEffect, useRef, useState } from "react";

export function Transformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Play video when in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Track video progress for text reveals
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onTimeUpdate() {
      if (video!.duration) {
        setVideoProgress(video!.currentTime / video!.duration);
      }
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  // Determine which text to show based on video progress
  const activeText =
    videoProgress < 0.25 ? 0 :
    videoProgress < 0.5 ? 1 :
    videoProgress < 0.75 ? 2 : 3;

  const TEXTS = [
    { main: "Старая обивка?", sub: "Не проблема" },
    { main: "Разберём", sub: "до каркаса" },
    { main: "Оденем", sub: "в новую ткань" },
    { main: "Как новый", sub: "С гарантией" },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#1a120b]">
      {/* Decorative corner ornaments */}
      <div className="absolute top-6 left-6 z-20 h-12 w-12 border-t-2 border-l-2 border-[var(--color-accent)]/30" />
      <div className="absolute top-6 right-6 z-20 h-12 w-12 border-t-2 border-r-2 border-[var(--color-accent)]/30" />
      <div className="absolute bottom-6 left-6 z-20 h-12 w-12 border-b-2 border-l-2 border-[var(--color-accent)]/30" />
      <div className="absolute bottom-6 right-6 z-20 h-12 w-12 border-b-2 border-r-2 border-[var(--color-accent)]/30" />

      <div className="relative aspect-[16/9] max-h-[85vh] w-full md:aspect-auto md:h-[85vh]">
        {/* Video */}
        <video
          ref={videoRef}
          src="/video/sofa-transform.mp4"
          muted
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-[#1a120b]/30 to-[#1a120b]/50" />

        {/* Animated text overlays */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center">
            {TEXTS.map((text, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center transition-all duration-700"
                style={{
                  opacity: activeText === i ? 1 : 0,
                  transform: activeText === i ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <div>
                  {/* Decorative line */}
                  <div className="mx-auto mb-6 flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-[var(--color-accent)]/50" />
                    <div className="h-1.5 w-1.5 rotate-45 bg-[var(--color-accent)]" />
                    <div className="h-px w-8 bg-[var(--color-accent)]/50" />
                  </div>
                  <h2 className="font-serif text-4xl font-bold text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
                    {text.main}
                  </h2>
                  <p className="mt-2 font-accent text-xl italic text-[var(--color-accent)] md:text-3xl">
                    {text.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${videoProgress * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {TEXTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeText ? "w-8 bg-[var(--color-primary)]" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="h-16 bg-gradient-to-b from-[#1a120b] to-[var(--bg-primary)]" />
    </section>
  );
}
