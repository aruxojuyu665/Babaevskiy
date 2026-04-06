"use client";

import { AnimatePresence, motion } from "framer-motion";

interface MorphButtonProps {
  state: "idle" | "loading" | "success";
  idleText: string;
  onClick?: () => void;
  className?: string;
}

export function MorphButton({ state, idleText, onClick, className = "" }: MorphButtonProps) {
  return (
    <motion.button
      onClick={state === "idle" ? onClick : undefined}
      disabled={state !== "idle"}
      className={`relative overflow-hidden rounded-full bg-[var(--color-primary)] font-medium text-white transition-colors disabled:cursor-not-allowed ${className}`}
      layout
      animate={{
        width: state === "loading" ? 56 : "auto",
        borderRadius: state === "loading" ? 9999 : 9999,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="block px-8 py-4 text-base"
          >
            {idleText}
          </motion.span>
        )}

        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex h-14 w-14 items-center justify-center"
          >
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="50" strokeDashoffset="15" strokeLinecap="round" />
            </svg>
          </motion.span>
        )}

        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-14 items-center justify-center px-8"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            </motion.svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
