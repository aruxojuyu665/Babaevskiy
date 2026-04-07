"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, DepthOfField, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

interface FurnitureViewerCanvasProps {
  activeFabric: string;
}

function ArmchairModel({ activeFabric }: { activeFabric: string }) {
  const { scene, nodes } = useGLTF("/models/armchair/armchair.gltf");
  const groupRef = useRef<THREE.Group>(null);
  const [prevFabric, setPrevFabric] = useState(activeFabric);
  const opacityRef = useRef(1);

  // Log all node names on first render for debugging
  useEffect(() => {
    console.log("=== GLTF Model Nodes ===");
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        console.log(`Mesh: "${node.name}" | Material: ${((node as THREE.Mesh).material as THREE.Material).name}`);
      }
    });
  }, [scene]);

  // Load textures for current fabric
  const basePath = `/models/fabric-textures/${activeFabric}`;
  let fabricTextures: { map?: THREE.Texture; normalMap?: THREE.Texture; roughnessMap?: THREE.Texture } = {};

  try {
    const [colorMap, normalMap, roughnessMap] = useTexture([
      `${basePath}/color.jpg`,
      `${basePath}/normal.jpg`,
      `${basePath}/roughness.jpg`,
    ]);
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.flipY = false;
    });
    fabricTextures = { map: colorMap, normalMap, roughnessMap };
  } catch {
    // Textures not available yet
  }

  // Animate fabric change — fade out, swap, fade in
  useEffect(() => {
    if (activeFabric === prevFabric) return;

    async function animateSwap() {
      const gsap = (await import("gsap")).default;

      // Find upholstery meshes (try common names)
      const upholsteryMeshes: THREE.Mesh[] = [];
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (mesh.isMesh) {
          const name = mesh.name.toLowerCase();
          // Match common upholstery names
          if (name.includes("pillow") || name.includes("cushion") || name.includes("seat") ||
              name.includes("fabric") || name.includes("upholster") || name.includes("cloth")) {
            upholsteryMeshes.push(mesh);
          }
        }
      });

      // If no specific mesh found, apply to all meshes except legs-like names
      if (upholsteryMeshes.length === 0) {
        scene.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (mesh.isMesh) {
            const name = mesh.name.toLowerCase();
            if (!name.includes("leg") && !name.includes("frame") && !name.includes("wood")) {
              upholsteryMeshes.push(mesh);
            }
          }
        });
      }

      // Fade out
      for (const mesh of upholsteryMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        gsap.to(mat, { opacity: 0, duration: 0.3 });
      }

      await new Promise((r) => setTimeout(r, 350));

      // Swap textures
      for (const mesh of upholsteryMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (fabricTextures.map) mat.map = fabricTextures.map;
        if (fabricTextures.normalMap) mat.normalMap = fabricTextures.normalMap;
        if (fabricTextures.roughnessMap) mat.roughnessMap = fabricTextures.roughnessMap;
        mat.needsUpdate = true;
      }

      // Fade in
      for (const mesh of upholsteryMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        gsap.to(mat, { opacity: 1, duration: 0.3 });
      }

      setPrevFabric(activeFabric);
    }

    animateSwap();
  }, [activeFabric, prevFabric, scene, fabricTextures]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1} position={[0, -0.5, 0]} />
    </group>
  );
}

function FallbackBox({ activeFabric }: { activeFabric: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors: Record<string, string> = {
    velvet: "#8B6544",
    leather: "#A0937D",
    linen: "#C4B49A",
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1, 1.5]} />
      <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.7} />
    </mesh>
  );
}

function Scene({ activeFabric }: { activeFabric: string }) {
  const [modelAvailable, setModelAvailable] = useState(true);

  return (
    <>
      {/* Warm studio lighting */}
      <ambientLight intensity={0.3} color="#FFF8F0" />
      <directionalLight position={[5, 5, 5]} intensity={0.7} color="#FFF5E6" castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFF0E0" />

      {/* Environment for reflections */}
      <Environment preset="apartment" />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.3}
        scale={5}
        blur={2}
        color="#2C1810"
      />

      {/* Model or fallback */}
      <Suspense fallback={<FallbackBox activeFabric={activeFabric} />}>
        {modelAvailable ? (
          <ErrorBoundaryModel activeFabric={activeFabric} onError={() => setModelAvailable(false)} />
        ) : (
          <FallbackBox activeFabric={activeFabric} />
        )}
      </Suspense>

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 4}
      />

      {/* Post-processing */}
      <EffectComposer>
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
        <Vignette darkness={0.3} />
      </EffectComposer>
    </>
  );
}

function ErrorBoundaryModel({ activeFabric, onError }: { activeFabric: string; onError: () => void }) {
  useEffect(() => {
    // Check if model file exists
    fetch("/models/armchair/armchair.gltf", { method: "HEAD" })
      .then((res) => {
        if (!res.ok) onError();
      })
      .catch(() => onError());
  }, [onError]);

  return <ArmchairModel activeFabric={activeFabric} />;
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
