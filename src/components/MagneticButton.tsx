"use client";

import { useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  as = "button",
  href,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  function handleMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * strength}px, ${y * strength}px)`);
  }

  function handleMouseLeave() {
    setTransform("translate(0px, 0px)");
  }

  const props = {
    ref: ref as React.Ref<HTMLButtonElement & HTMLAnchorElement>,
    className: `magnetic-btn ${className}`,
    style: { transform } as React.CSSProperties,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick,
  };

  if (as === "a" && href) {
    return <a {...props} href={href}>{children}</a>;
  }

  return <button {...props}>{children}</button>;
}
