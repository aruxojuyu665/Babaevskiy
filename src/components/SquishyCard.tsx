"use client";

import { motion } from "framer-motion";

interface SquishyCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SquishyCard({ children, className = "" }: SquishyCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 15 },
      }}
      whileTap={{
        scale: 0.97,
        transition: { type: "spring", stiffness: 400, damping: 10, bounce: 0.4 },
      }}
    >
      {children}
    </motion.div>
  );
}
