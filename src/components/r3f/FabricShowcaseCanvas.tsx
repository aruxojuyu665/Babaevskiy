"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { FabricPlane } from "./FabricPlane";

const FABRIC_IDS = ["velvet", "leather", "linen", "wool", "fleece"];

// Container is ~1920×440 → aspect ~4.4:1
// fov=42 (vertical), z=5.5 → visible height ≈ 2*tan(21°)*5.5 ≈ 4.2
// visible width ≈ 4.2 * 4.4 ≈ 18.5 — fits 5 planes of 2.5 at spacing 3.0
const PLANE_SIZE = 2.4;
const SPACING = 2.8;

function Scene() {
  return (
    <>
      <ambientLight intensity={0.45} color="#FFF8F0" />
      <directionalLight position={[3, 4, 5]} intensity={0.55} color="#FFF5E6" />
      <directionalLight position={[-2, 1, 3]} intensity={0.15} color="#FFF0E0" />

      <Suspense fallback={null}>
        {FABRIC_IDS.map((id, i) => {
          const x = (i - 2) * SPACING;
          return (
            <FabricPlane
              key={id}
              fabricId={id}
              position={[x, 0, 0]}
              size={PLANE_SIZE}
            />
          );
        })}
      </Suspense>
    </>
  );
}

export function FabricShowcaseCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      // NO frameloop="demand" — needs continuous rendering for wave animation
    >
      <Scene />
    </Canvas>
  );
}
