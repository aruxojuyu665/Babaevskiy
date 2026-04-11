"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { FabricPlane } from "./FabricPlane";
import * as THREE from "three";

const FABRIC_IDS = ["velvet", "leather", "linen", "wool", "fleece"];

const PLANE_SIZE = 2.4;
const SPACING = 2.8;

// World half-width needed to fit all 5 planes + margin
const REQUIRED_HALF_WIDTH =
  ((FABRIC_IDS.length - 1) / 2) * SPACING + PLANE_SIZE / 2 + 0.3;

function CameraController() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    // With OrthographicCamera, R3F uses left/right/top/bottom of -1..1
    // and applies zoom: visibleWorldWidth = (right - left) / zoom = 2 / zoom
    // We want visibleWorldWidth = 2 * REQUIRED_HALF_WIDTH
    // So zoom = 1 / REQUIRED_HALF_WIDTH... but we also need correct aspect
    // R3F sets left/right to -size.width/2, right: size.width/2, so visible = size.width / zoom
    // We want size.width / zoom = 2 * REQUIRED_HALF_WIDTH (pixels per world unit)
    // => zoom = size.width / (2 * REQUIRED_HALF_WIDTH)
    cam.zoom = size.width / (2 * REQUIRED_HALF_WIDTH);
    cam.position.set(0, 0, 5);
    cam.lookAt(0, 0, 0);
    cam.near = 0.1;
    cam.far = 100;
    cam.updateProjectionMatrix();
  }, [size, camera]);

  return null;
}

function Scene() {
  return (
    <>
      <CameraController />
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
      orthographic
      camera={{ position: [0, 0, 5], zoom: 100, near: 0.1, far: 100 }}
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
