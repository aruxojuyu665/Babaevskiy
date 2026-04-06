"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SwipeCard {
  id: number;
  title: string;
  image: string;
}

interface SwipeCardsProps {
  cards: SwipeCard[];
}

export function SwipeCards({ cards }: SwipeCardsProps) {
  const [stack, setStack] = useState(cards);

  function handleDragEnd(id: number, info: { offset: { x: number } }) {
    if (Math.abs(info.offset.x) > 100) {
      setStack((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="relative mx-auto h-[350px] w-[280px] md:h-[400px] md:w-[320px]">
      <AnimatePresence>
        {stack.map((card, i) => (
          <motion.div
            key={card.id}
            className="absolute inset-0 cursor-grab overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-warm-lg)] active:cursor-grabbing"
            style={{
              zIndex: stack.length - i,
              rotate: `${(i - stack.length / 2) * 2}deg`,
              scale: 1 - i * 0.03,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => handleDragEnd(card.id, info)}
            exit={{ x: 300, opacity: 0, rotate: "15deg" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="relative h-[75%]">
              <Image src={card.image} alt={card.title} fill className="object-cover" sizes="320px" />
            </div>
            <div className="p-3 text-center">
              <p className="font-serif text-lg font-semibold text-[var(--text-primary)]">{card.title}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {stack.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <button
            onClick={() => setStack(cards)}
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white"
          >
            Показать снова
          </button>
        </div>
      )}
    </div>
  );
}
