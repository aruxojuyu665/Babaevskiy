"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/animations";

interface TextGenerateEffectProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextGenerateEffect({ text, className = "", delay = 0 }: TextGenerateEffectProps) {
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();
  const words = text.split(" ");

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={started ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.4,
            delay: i * 0.04,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
