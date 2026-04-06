"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollFloatProps {
  children: string;
  className?: string;
}

export function ScrollFloat({ children, className = "" }: ScrollFloatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ y: 20, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.span>
  );
}
