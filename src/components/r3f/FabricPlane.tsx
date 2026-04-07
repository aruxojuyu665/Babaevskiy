"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uWaveAmp;
uniform float uStiffness;
uniform float uWaveSpeed;

varying vec2 vUv;
varying float vDisplacement;

void main() {
  vUv = uv;
  vec3 pos = position;

  float speed = uTime * uWaveSpeed;
  float wave1 = sin(pos.x * 2.0 + speed * 0.6)
              * cos(pos.y * 1.5 + speed * 0.4);
  float wave2 = sin(pos.x * 1.2 - speed * 0.3)
              * sin(pos.y * 2.5 + speed * 0.5);
  float wave3 = cos(pos.x * 3.0 + pos.y * 2.0 + speed * 0.2) * 0.3;
  float baseWave = (wave1 + wave2 * 0.5 + wave3) * uWaveAmp;

  float dist = distance(uv, uMouse);
  float radius = 0.35;

  float press = smoothstep(radius, 0.0, dist) * uHover;
  float gather = smoothstep(radius * 2.0, radius, dist)
               * smoothstep(0.0, radius * 0.5, dist) * uHover;

  float displacement = baseWave * (1.0 - press * 0.9)
                     + baseWave * gather * 1.5;
  displacement *= mix(1.0, 0.6, uStiffness);

  pos.z += displacement;
  vDisplacement = displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;

varying vec2 vUv;
varying float vDisplacement;

void main() {
  vec3 color = texture2D(uColorMap, vUv).rgb;

  float shadow = smoothstep(-0.15, 0.15, vDisplacement);
  color *= mix(0.7, 1.1, shadow);

  float roughness = texture2D(uRoughnessMap, vUv).r;
  float highlight = pow(shadow, 3.0) * (1.0 - roughness) * 0.15;
  color += highlight;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface FabricConfig {
  waveAmp: number;
  stiffness: number;
  waveSpeed: number;
}

const FABRIC_CONFIGS: Record<string, FabricConfig> = {
  velvet:  { waveAmp: 0.12, stiffness: 0.2, waveSpeed: 1.0 },
  leather: { waveAmp: 0.06, stiffness: 0.7, waveSpeed: 0.6 },
  linen:   { waveAmp: 0.10, stiffness: 0.3, waveSpeed: 1.2 },
  wool:    { waveAmp: 0.09, stiffness: 0.5, waveSpeed: 0.8 },
  fleece:  { waveAmp: 0.13, stiffness: 0.15, waveSpeed: 1.1 },
};

interface FabricPlaneProps {
  fabricId: string;
  position: [number, number, number];
}

export function FabricPlane({ fabricId, position }: FabricPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { gl } = useThree();

  const config = FABRIC_CONFIGS[fabricId] || FABRIC_CONFIGS.velvet;

  const basePath = `/models/fabric-textures/${fabricId}`;
  const [colorMap, normalMap, roughnessMap] = useTexture([
    `${basePath}/color.jpg`,
    `${basePath}/normal.jpg`,
    `${basePath}/roughness.jpg`,
  ]);

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    [colorMap, normalMap, roughnessMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.5, 1.5);
      t.anisotropy = maxAniso;
    });
  }, [colorMap, normalMap, roughnessMap, gl]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uWaveAmp: { value: config.waveAmp },
      uStiffness: { value: config.stiffness },
      uWaveSpeed: { value: config.waveSpeed },
      uColorMap: { value: colorMap },
      uNormalMap: { value: normalMap },
      uRoughnessMap: { value: roughnessMap },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.waveAmp, config.stiffness, config.waveSpeed]
  );

  // Update texture uniforms when they change
  useEffect(() => {
    uniforms.uColorMap.value = colorMap;
    uniforms.uNormalMap.value = normalMap;
    uniforms.uRoughnessMap.value = roughnessMap;
  }, [colorMap, normalMap, roughnessMap, uniforms]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;

    // Smooth lerp mouse position
    smoothMouse.current.lerp(targetMouse.current, 0.08);
    uniforms.uMouse.value.copy(smoothMouse.current);
  });

  function handlePointerMove(e: THREE.Intersection) {
    if (e.uv) {
      targetMouse.current.set(e.uv.x, e.uv.y);
    }
  }

  async function handlePointerEnter() {
    const gsap = (await import("gsap")).default;
    gsap.to(uniforms.uHover, { value: 1, duration: 0.4 });
  }

  async function handlePointerLeave() {
    const gsap = (await import("gsap")).default;
    gsap.to(uniforms.uHover, { value: 0, duration: 0.8 });
    targetMouse.current.set(0.5, 0.5);
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-0.15, 0, 0]}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.intersections[0]) handlePointerMove(e.intersections[0]);
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[2.5, 2.5, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
