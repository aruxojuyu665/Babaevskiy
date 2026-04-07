"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { FabricPlane } from "./FabricPlane";

const FABRIC_IDS = ["velvet", "leather", "linen", "wool", "fleece"];
const SPACING = 2.75;

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} color="#FFF8F0" />
      <directionalLight position={[2, 3, 4]} intensity={0.6} color="#FFF5E6" />

      <Suspense fallback={null}>
        {FABRIC_IDS.map((id, i) => {
          const x = (i - 2) * SPACING; // Center the 5 planes
          return <FabricPlane key={id} fabricId={id} position={[x, 0, 0]} />;
        })}
      </Suspense>
    </>
  );
}

export function FabricShowcaseCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 35 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
