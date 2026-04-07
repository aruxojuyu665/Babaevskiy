"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface FurnitureViewerCanvasProps {
  activeFabric: string;
}

function ArmchairModel({ activeFabric }: { activeFabric: string }) {
  const { scene } = useGLTF("/models/armchair/armchair.gltf");
  const swappedRef = useRef<string>("");

  // Load fabric PBR textures
  const basePath = `/models/fabric-textures/${activeFabric}`;
  const [colorMap, normalMap, roughnessMap] = useTexture([
    `${basePath}/color.jpg`,
    `${basePath}/normal.jpg`,
    `${basePath}/roughness.jpg`,
  ]);

  useEffect(() => {
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.flipY = false;
    });
  }, [colorMap, normalMap, roughnessMap]);

  // Swap pillow textures when fabric changes
  useEffect(() => {
    if (swappedRef.current === activeFabric) return;

    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (mat.name.toLowerCase().includes("pillow")) {
          const stdMat = mat as THREE.MeshStandardMaterial;
          stdMat.map = colorMap;
          stdMat.normalMap = normalMap;
          stdMat.roughnessMap = roughnessMap;
          stdMat.needsUpdate = true;
        }
      });
    });

    swappedRef.current = activeFabric;
  }, [activeFabric, scene, colorMap, normalMap, roughnessMap]);

  return <primitive object={scene} scale={2} position={[0, -0.8, 0]} />;
}

function FallbackBox({ activeFabric }: { activeFabric: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors: Record<string, string> = { velvet: "#8B6544", leather: "#A0937D", linen: "#C4B49A" };

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group>
      {/* Simplified armchair shape */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.6, 1]} />
        <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.5, -0.45]}>
        <boxGeometry args={[1.2, 0.5, 0.15]} />
        <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.8} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.55, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.3, 1]} />
        <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.8} />
      </mesh>
      <mesh position={[0.55, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.3, 1]} />
        <meshStandardMaterial color={colors[activeFabric] || "#8B6544"} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Scene({ activeFabric }: { activeFabric: string }) {
  const [modelOk, setModelOk] = useState(true);

  useEffect(() => {
    fetch("/models/armchair/armchair.gltf", { method: "HEAD" })
      .then((r) => { if (!r.ok) setModelOk(false); })
      .catch(() => setModelOk(false));
  }, []);

  return (
    <>
      {/* Warm studio lighting — simplified */}
      <ambientLight intensity={0.4} color="#FFF8F0" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFF5E6" />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFF0E0" />

      <Environment preset="apartment" />

      <ContactShadows position={[0, -0.8, 0]} opacity={0.2} scale={4} blur={2.5} color="#2C1810" />

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
