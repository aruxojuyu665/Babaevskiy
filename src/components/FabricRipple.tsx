"use client";

import { useEffect, useRef } from "react";

export function FabricRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width = w;
      canvas!.height = h;
    }

    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }

    // Listen on document since canvas parent has pointer-events:none
    document.addEventListener("mousemove", onMouseMove);

    function draw() {
      // Smooth follow
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.08;
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.08;

      ctx!.clearRect(0, 0, w, h);

      const mx = smoothMouse.current.x;
      const my = smoothMouse.current.y;
      const time = Date.now() * 0.0008;

      // Draw visible fabric-like distortion waves
      const cols = 50;
      const rows = 30;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = (c + 0.5) / cols;
          const cy = (r + 0.5) / rows;

          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Ripple wave from mouse position
          const wave = Math.sin(dist * 15 - time * 3) * Math.max(0, 0.8 - dist * 2);
          const offsetX = wave * 4;
          const offsetY = wave * 3;

          // Brightness — more visible near cursor
          const brightness = wave * 0.06;

          if (Math.abs(brightness) < 0.005) continue;

          const x = c * cellW + offsetX;
          const y = r * cellH + offsetY;

          if (brightness > 0) {
            ctx!.fillStyle = `rgba(196, 149, 106, ${brightness})`;
          } else {
            ctx!.fillStyle = `rgba(44, 24, 16, ${-brightness * 0.5})`;
          }
          ctx!.fillRect(x, y, cellW + 0.5, cellH + 0.5);
        }
      }

      frame = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 1, mixBlendMode: "overlay" }}
    />
  );
}
