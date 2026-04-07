"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface FurnitureViewerCanvasProps {
  activeFabric: string;
}

function ArmchairModel({ activeFabric }: { activeFabric: string }) {
  const { scene } = useGLTF("/models/armchair/armchair.gltf");
  const swappedRef = useRef("");

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

  useEffect(() => {
    if (swappedRef.current === activeFabric) return;

    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (mat.name.toLowerCase().includes("pillow")) {
          const m = mat as THREE.MeshStandardMaterial;
          m.map = colorMap;
          m.normalMap = normalMap;
          m.roughnessMap = roughnessMap;
          m.needsUpdate = true;
        }
      });
    });

    swappedRef.current = activeFabric;
  }, [activeFabric, scene, colorMap, normalMap, roughnessMap]);

  return <primitive object={scene} scale={2} position={[0, -0.8, 0]} />;
}

function FallbackChair({ activeFabric }: { activeFabric: string }) {
  const ref = useRef<THREE.Group>(null);
  const colors: Record<string, string> = { velvet: "#8B6544", leather: "#A0937D", linen: "#C4B49A" };
  const c = colors[activeFabric] || "#8B6544";

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3; });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.5, 1]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, -0.42]}>
        <boxGeometry args={[1.2, 0.6, 0.15]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Handle WebGL context loss gracefully
function ContextLossHandler({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handler = () => onLost();
    canvas.addEventListener("webglcontextlost", handler);
    return () => canvas.removeEventListener("webglcontextlost", handler);
  }, [gl, onLost]);
  return null;
}

export function FurnitureViewerCanvas({ activeFabric }: FurnitureViewerCanvasProps) {
  const [modelOk, setModelOk] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    fetch("/models/armchair/armchair.gltf", { method: "HEAD" })
      .then((r) => { if (!r.ok) setModelOk(false); })
      .catch(() => setModelOk(false));
  }, []);

  // If context lost, show static fallback
  if (contextLost) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)]">
        <p className="text-sm">3D не поддерживается вашим устройством</p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [2.5, 1.5, 2.5], fov: 40 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      }}
      dpr={1}
      style={{ background: "transparent" }}
      frameloop="demand"
    >
      <ContextLossHandler onLost={() => setContextLost(true)} />

      {/* Simple lighting — no Environment HDR (saves GPU) */}
      <ambientLight intensity={0.5} color="#FFF8F0" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFF5E6" />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFF0E0" />
      <directionalLight position={[0, -2, 3]} intensity={0.15} color="#FFF8F0" />

      <ContactShadows position={[0, -0.8, 0]} opacity={0.15} scale={4} blur={2} color="#2C1810" />

      <Suspense fallback={<FallbackChair activeFabric={activeFabric} />}>
        {modelOk ? (
          <ArmchairModel activeFabric={activeFabric} />
        ) : (
          <FallbackChair activeFabric={activeFabric} />
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
    </Canvas>
  );
}
