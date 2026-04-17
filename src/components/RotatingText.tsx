"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface RotatingTextProps {
  prefix: string;
  words: string[];
  className?: string;
  interval?: number;
}

export function RotatingText({
  prefix,
  words,
  className = "",
  interval = 3000,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  // Reserve width of the longest word so prefix doesn't shift when word changes.
  const longest = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  );

  return (
    <span className={className}>
      {prefix}{" "}
      <span className="relative inline-block overflow-hidden align-bottom">
        {/* Invisible spacer fixes the rotating slot to the longest word. */}
        <span aria-hidden className="invisible font-semibold whitespace-nowrap">
          {longest}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            className="absolute inset-0 inline-block font-semibold text-[#4A2C1A] whitespace-nowrap"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
