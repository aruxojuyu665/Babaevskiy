"use client";

import { useEffect, useRef } from "react";

export function FabricRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      targetRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }

    canvas.addEventListener("mousemove", onMouseMove);

    function draw() {
      // Smooth lerp toward target
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx!.clearRect(0, 0, width, height);

      // Draw fabric-like wave pattern influenced by mouse
      const time = Date.now() * 0.001;
      const cols = 40;
      const rows = 25;
      const cellW = width / cols;
      const cellH = height / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = (col + 0.5) / cols;
          const cy = (row + 0.5) / rows;

          // Distance from mouse
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Displacement wave
          const wave = Math.sin(dist * 12 - time * 2) * Math.max(0, 1 - dist * 2.5);
          const offsetX = wave * 3;
          const offsetY = wave * 2;

          // Brightness variation
          const brightness = 0.02 + wave * 0.015;

          const x = col * cellW + offsetX;
          const y = row * cellH + offsetY;

          ctx!.fillStyle = `rgba(196, 149, 106, ${Math.abs(brightness)})`;
          ctx!.fillRect(x, y, cellW + 1, cellH + 1);
        }
      }

      animFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0 h-full w-full opacity-60"
      style={{ mixBlendMode: "soft-light" }}
    />
  );
}
