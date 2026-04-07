"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, DepthOfField, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

interface FurnitureViewerCanvasProps {
  activeFabric: string;
}

function ArmchairModel({ activeFabric }: { activeFabric: string }) {
  const { scene } = useGLTF("/models/armchair/armchair.gltf");
  const [prevFabric, setPrevFabric] = useState(activeFabric);

  // Load fabric PBR textures
  const basePath = `/models/fabric-textures/${activeFabric}`;
  const [colorMap, normalMap, roughnessMap] = useTexture([
    `${basePath}/color.jpg`,
    `${basePath}/normal.jpg`,
    `${basePath}/roughness.jpg`,
  ]);

  // Configure texture wrapping
  useEffect(() => {
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.flipY = false;
    });
  }, [colorMap, normalMap, roughnessMap]);

  // Find pillow material and swap textures with GSAP fade
  useEffect(() => {
    if (activeFabric === prevFabric && prevFabric !== "velvet") return;

    async function swapTextures() {
      const gsap = (await import("gsap")).default;

      // Find all materials named "pillow"
      const pillowMaterials: THREE.MeshStandardMaterial[] = [];
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat.name.toLowerCase().includes("pillow")) {
              pillowMaterials.push(mat as THREE.MeshStandardMaterial);
            }
          });
        } else if (mesh.material.name.toLowerCase().includes("pillow")) {
          pillowMaterials.push(mesh.material as THREE.MeshStandardMaterial);
        }
      });

      if (pillowMaterials.length === 0) return;

      // Fade out
      for (const mat of pillowMaterials) {
        mat.transparent = true;
        await gsap.to(mat, { opacity: 0, duration: 0.25 });
      }

      // Swap textures
      for (const mat of pillowMaterials) {
        mat.map = colorMap;
        mat.normalMap = normalMap;
        mat.roughnessMap = roughnessMap;
        mat.needsUpdate = true;
      }

      // Fade in
      for (const mat of pillowMaterials) {
        gsap.to(mat, { opacity: 1, duration: 0.25 });
      }

      setPrevFabric(activeFabric);
    }

    swapTextures();
  }, [activeFabric, prevFabric, scene, colorMap, normalMap, roughnessMap]);

  return <primitive object={scene} scale={2} position={[0, -0.8, 0]} />;
}

function FallbackBox({ activeFabric }: { activeFabric: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors: Record<string, string> = { velvet: "#8B6544", leather: "#A0937D", linen: "#C4B49A" };

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.2, 0.8, 1.2, 4, 4, 4]} />
      <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.7} />
    </mesh>
  );
}

function Scene({ activeFabric }: { activeFabric: string }) {
  const [modelOk, setModelOk] = useState(true);

  // Pre-check model availability
  useEffect(() => {
    fetch("/models/armchair/armchair.gltf", { method: "HEAD" })
      .then((r) => { if (!r.ok) setModelOk(false); })
      .catch(() => setModelOk(false));
  }, []);

  return (
    <>
      {/* Warm studio lighting */}
      <ambientLight intensity={0.3} color="#FFF8F0" />
      <directionalLight position={[5, 5, 5]} intensity={0.7} color="#FFF5E6" castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFF0E0" />

      <Environment preset="apartment" />

      <ContactShadows position={[0, -0.8, 0]} opacity={0.25} scale={4} blur={2.5} color="#2C1810" />

      <Suspense fallback={<FallbackBox activeFabric={activeFabric} />}>
        {modelOk ? (
          <ArmchairModel activeFabric={activeFabric} />
        ) : (
          <FallbackBox activeFabric={activeFabric} />
        )}
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 4}
      />

      <EffectComposer>
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
        <Vignette darkness={0.3} />
      </EffectComposer>
    </>
  );
}

export function FurnitureViewerCanvas({ activeFabric }: FurnitureViewerCanvasProps) {
  return (
    <Canvas
      camera={{ position: [2.5, 1.5, 2.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Scene activeFabric={activeFabric} />
    </Canvas>
  );
}
