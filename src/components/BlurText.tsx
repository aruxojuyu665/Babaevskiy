"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/animations";

interface BlurTextProps {
  text: string;
  className?: string;
}

export function BlurText({ text, className = "" }: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.5,
            delay: i * 0.03,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
