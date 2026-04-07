"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface FabricSwatchCanvasProps {
  fabricId: string;
}

function FabricMesh({ fabricId }: { fabricId: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePos = useRef(new THREE.Vector3(999, 999, 0));
  const { raycaster, pointer, camera } = useThree();

  // Load PBR textures
  const basePath = `/models/fabric-textures/${fabricId}`;
  let textures: { map?: THREE.Texture; normalMap?: THREE.Texture; roughnessMap?: THREE.Texture } = {};

  try {
    const [colorMap, normalMap, roughnessMap] = useTexture([
      `${basePath}/color.jpg`,
      `${basePath}/normal.jpg`,
      `${basePath}/roughness.jpg`,
    ]);
    // Set wrapping
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
    });
    textures = { map: colorMap, normalMap, roughnessMap };
  } catch {
    // Textures not available — use fallback color
  }

  // Create geometry with enough segments for wave deformation
  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4, 20, 20), []);
  const originalPositions = useMemo(() => {
    const pos = geometry.attributes.position.array.slice();
    return new Float32Array(pos);
  }, [geometry]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Raycast for mouse position
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      mousePos.current.copy(intersects[0].point);
    } else {
      mousePos.current.set(999, 999, 0);
    }

    // Animate vertices — fabric breathing
    const positionAttr = mesh.geometry.attributes.position;
    const time = clock.elapsedTime;

    for (let i = 0; i < positionAttr.count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];

      // Distance from mouse
      const dx = x - mousePos.current.x;
      const dy = y - mousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Smoothstep: at cursor → flat, around cursor → amplified
      const cursorRadius = 3;
      let amplitude = 0.15;
      if (dist < cursorRadius) {
        const t = dist / cursorRadius;
        // Smoothstep
        const smooth = t * t * (3 - 2 * t);
        amplitude = smooth * 0.25; // amplified near edges, flat at center
      }

      // Sine wave deformation
      const z = Math.sin(x * 0.5 + time * 0.8) * Math.cos(y * 0.3 + time * 0.6) * amplitude;

      positionAttr.setZ(i, z);
    }

    positionAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-0.3, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[4, 4, 20, 20]} />
      <meshStandardMaterial
        {...textures}
        color={textures.map ? undefined : "#8B6544"}
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
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} color="#FFF8F0" />
      <directionalLight position={[3, 3, 3]} intensity={0.6} color="#FFF5E6" />
      <FabricMesh fabricId={fabricId} />
    </Canvas>
  );
}
