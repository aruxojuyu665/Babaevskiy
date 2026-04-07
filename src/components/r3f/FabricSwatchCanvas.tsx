"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface FabricSwatchCanvasProps {
  fabricId: string;
}

function FabricPlane({ fabricId }: { fabricId: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePos = useRef(new THREE.Vector3(999, 999, 0));
  const { raycaster, pointer, camera } = useThree();

  // Load PBR textures
  const basePath = `/models/fabric-textures/${fabricId}`;
  const [colorMap, normalMap, roughnessMap] = useTexture([
    `${basePath}/color.jpg`,
    `${basePath}/normal.jpg`,
    `${basePath}/roughness.jpg`,
  ]);

  useMemo(() => {
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
    });
  }, [colorMap, normalMap, roughnessMap]);

  const geo = useMemo(() => new THREE.PlaneGeometry(4, 4, 20, 20), []);
  const originalZ = useMemo(() => {
    const arr = new Float32Array(geo.attributes.position.count);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = geo.attributes.position.getZ(i);
    }
    return arr;
  }, [geo]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(mesh);
    if (hits.length > 0) {
      mousePos.current.copy(hits[0].point);
    } else {
      mousePos.current.set(999, 999, 0);
    }

    const pos = mesh.geometry.attributes.position;
    const time = clock.elapsedTime;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const dx = x - mousePos.current.x;
      const dy = y - mousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const radius = 3;
      let amp = 0.15;
      if (dist < radius) {
        const t = dist / radius;
        amp = t * t * (3 - 2 * t) * 0.25;
      }

      const z = Math.sin(x * 0.5 + time * 0.8) * Math.cos(y * 0.3 + time * 0.6) * amp;
      pos.setZ(i, z);
    }

    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-0.3, 0, 0]}>
      <planeGeometry args={[4, 4, 20, 20]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        roughness={0.8}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function FabricSwatchCanvas({ fabricId }: FabricSwatchCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} color="#FFF8F0" />
      <directionalLight position={[3, 3, 3]} intensity={0.6} color="#FFF5E6" />
      <FabricPlane fabricId={fabricId} />
    </Canvas>
  );
}
