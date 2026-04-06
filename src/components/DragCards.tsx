"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface DragCard {
  src: string;
  alt: string;
  rotate: string;
  top: string;
  left: string;
  className?: string;
}

const FABRIC_CARDS: DragCard[] = [
  { src: "/textures/velvet-warm.jpg", alt: "Велюр", rotate: "-6deg", top: "10%", left: "5%" },
  { src: "/textures/leather-cognac.jpg", alt: "Кожа", rotate: "4deg", top: "20%", left: "55%" },
  { src: "/textures/fabric-swatches.jpg", alt: "Каталог тканей", rotate: "-3deg", top: "55%", left: "25%" },
  { src: "/process/craftsman-hands.jpg", alt: "Руки мастера", rotate: "7deg", top: "5%", left: "35%" },
  { src: "/process/craftsman-working.jpg", alt: "Мастер за работой", rotate: "-4deg", top: "45%", left: "60%" },
];

export function DragCards() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={constraintsRef}
      className="relative mx-auto h-[400px] w-full max-w-5xl overflow-hidden md:h-[500px]"
    >
      {FABRIC_CARDS.map((card, i) => (
        <motion.div
          key={i}
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.15}
          whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
          whileHover={{ scale: 1.03 }}
          className="absolute w-32 cursor-grab overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-warm)] md:w-44"
          style={{
            top: card.top,
            left: card.left,
            rotate: card.rotate,
          }}
        >
          <div className="aspect-[3/4] relative">
            <Image src={card.src} alt={card.alt} fill className="object-cover" sizes="180px" />
          </div>
          <p className="px-2 py-1.5 text-center text-xs text-[var(--text-secondary)]">{card.alt}</p>
        </motion.div>
      ))}
    </div>
  );
}
