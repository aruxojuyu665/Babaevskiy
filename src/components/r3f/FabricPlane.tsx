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
uniform float uClipHalf;

varying vec2 vUv;
varying float vDisplacement;
varying vec2 vLocalPos;
varying vec3 vWaveNormal;

// Wave height field — single function used for both position and gradient
float waveHeight(vec2 p, float speed) {
  float w1 = sin(p.x * 1.6 + speed * 1.3) * 1.00;
  float w2 = sin(p.y * 2.2 + speed * 0.9) * 0.45;
  float w3 = sin(p.x * 3.2 + p.y * 1.8 + speed * 1.0) * 0.45;
  float w4 = cos(p.x * 5.0 - p.y * 2.5 + speed * 1.8) * 0.18;
  float w5 = sin(length(p) * 2.5 - speed * 0.7) * 0.20;
  return w1 + w2 + w3 + w4 + w5;
}

// Analytical gradient of waveHeight
vec2 waveGradient(vec2 p, float speed) {
  float dx = cos(p.x * 1.6 + speed * 1.3) * 1.6 * 1.00
           + cos(p.x * 3.2 + p.y * 1.8 + speed * 1.0) * 3.2 * 0.45
           - sin(p.x * 5.0 - p.y * 2.5 + speed * 1.8) * 5.0 * 0.18;
  float dy = cos(p.y * 2.2 + speed * 0.9) * 2.2 * 0.45
           + cos(p.x * 3.2 + p.y * 1.8 + speed * 1.0) * 1.8 * 0.45
           - sin(p.x * 5.0 - p.y * 2.5 + speed * 1.8) * (-2.5) * 0.18;
  // Radial ripple — approximate gradient (skip length() singularity at origin)
  float r = max(length(p), 0.001);
  float radialD = cos(r * 2.5 - speed * 0.7) * 2.5 * 0.20;
  dx += radialD * (p.x / r);
  dy += radialD * (p.y / r);
  return vec2(dx, dy);
}

void main() {
  vUv = uv;
  vec3 pos = position;
  vLocalPos = pos.xy;

  float speed = uTime * uWaveSpeed;

  // Edge dampening — narrow fade zone near clip boundary
  float fadeZone = uClipHalf * 0.08;
  float distFromEdgeX = uClipHalf - abs(vLocalPos.x);
  float distFromEdgeY = uClipHalf - abs(vLocalPos.y);
  float edgeFadeX = smoothstep(0.0, fadeZone, distFromEdgeX);
  float edgeFadeY = smoothstep(0.0, fadeZone, distFromEdgeY);
  float edgeFade  = edgeFadeX * edgeFadeY;
  if (distFromEdgeX < 0.0 || distFromEdgeY < 0.0) edgeFade = 0.0;

  // Wave height + gradient (for normal)
  float h = waveHeight(pos.xy, speed);
  vec2  g = waveGradient(pos.xy, speed);
  float baseWave = h * uWaveAmp * edgeFade;

  // Cursor interaction — finger presses fabric INTO the surface
  float dist = distance(uv, uMouse);
  float radius = 0.35;
  float falloff = smoothstep(radius, 0.0, dist);
  float press = falloff * falloff * uHover * edgeFade;
  float ring = smoothstep(radius * 1.6, radius * 0.9, dist)
             * smoothstep(0.0, radius * 0.4, dist) * uHover * edgeFade;

  float indent = -press * uWaveAmp * 4.5;
  float rimLift = ring * uWaveAmp * 0.8;

  float waveMask = 1.0 - press * 0.75;
  float displacement = baseWave * waveMask + indent + rimLift;
  displacement *= mix(1.0, 0.75, uStiffness);
  displacement *= edgeFade;

  pos.z += displacement;
  vDisplacement = displacement;

  // Build surface normal from wave gradient.
  // Surface: z = f(x,y), normal = normalize(-df/dx, -df/dy, 1)
  // Scale gradient by amp and masks so normals follow the actual displacement
  float normalScale = uWaveAmp * edgeFade * waveMask * mix(1.0, 0.75, uStiffness);
  vec3 waveN = normalize(vec3(-g.x * normalScale, -g.y * normalScale, 1.0));
  vWaveNormal = waveN;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform float uClipHalf;

varying vec2 vUv;
varying float vDisplacement;
varying vec2 vLocalPos;
varying vec3 vWaveNormal;

void main() {
  // Perfect rectangular clip
  if (abs(vLocalPos.x) > uClipHalf || abs(vLocalPos.y) > uClipHalf) discard;

  vec3 baseColor  = texture2D(uColorMap, vUv).rgb;
  vec3 normalTex  = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
  float roughness = texture2D(uRoughnessMap, vUv).r;

  // Combine geometric wave normal (low-frequency cloth deformation)
  // with texture normal (high-frequency fabric weave detail)
  vec3 N_wave = normalize(vWaveNormal);
  // Perturb wave normal by texture normal in its local frame
  vec3 N = normalize(vec3(
    N_wave.x + normalTex.x * 0.35,
    N_wave.y + normalTex.y * 0.35,
    N_wave.z
  ));

  vec3 V = vec3(0.0, 0.0, 1.0);

  // Two-light rig with strong directional contrast
  vec3 L1 = normalize(vec3( 0.45, 0.65, 0.75));  // warm key from upper-right
  vec3 L2 = normalize(vec3(-0.60, 0.15, 0.65));  // cool fill from left
  vec3 warmLight = vec3(1.00, 0.94, 0.80);
  vec3 coolLight = vec3(0.70, 0.80, 1.00);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);

  float NdotL1 = dot(N, L1);
  float NdotL2 = dot(N, L2);
  float NdotV  = max(dot(N, V), 0.0);
  float NdotH1 = max(dot(N, H1), 0.0);
  float NdotH2 = max(dot(N, H2), 0.0);

  // Wrap diffuse with deeper shadows — waves cast real light/shadow
  float diff1 = pow(max(NdotL1 * 0.5 + 0.5, 0.0), 2.2);
  float diff2 = pow(max(NdotL2 * 0.5 + 0.5, 0.0), 2.2);

  // Blinn-Phong specular — fabric gets subtle highlights on wave crests
  float shininess = mix(32.0, 4.0, roughness);
  float spec1 = pow(NdotH1, shininess) * (1.0 - roughness);
  float spec2 = pow(NdotH2, shininess) * (1.0 - roughness) * 0.6;

  // Fresnel rim
  float fresnel = pow(1.0 - NdotV, 3.0);

  // Ambient term — preserves base color in deepest shadows
  vec3 ambient = baseColor * vec3(0.22, 0.23, 0.26);

  // Diffuse — waves create natural shadow/light transitions
  vec3 diffuse = baseColor * (diff1 * warmLight * 1.10 + diff2 * coolLight * 0.45);

  // Specular — subtle sheen on crests
  vec3 specular = warmLight * spec1 * 0.40 + coolLight * spec2 * 0.22;

  // Rim light
  vec3 rim = vec3(1.00, 0.95, 0.85) * fresnel * 0.12 * (1.0 - roughness * 0.5);

  vec3 color = ambient + diffuse + specular + rim;

  // S-curve contrast
  color = clamp(color, 0.0, 1.0);
  color = color * color * (3.0 - 2.0 * color);

  // Saturation boost
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, 1.20);

  gl_FragColor = vec4(max(color, 0.0), 1.0);
}
`;

interface FabricConfig {
  waveAmp: number;
  stiffness: number;
  waveSpeed: number;
}

const FABRIC_CONFIGS: Record<string, FabricConfig> = {
  velvet:  { waveAmp: 0.55, stiffness: 0.10, waveSpeed: 1.1 },
  leather: { waveAmp: 0.38, stiffness: 0.35, waveSpeed: 0.75 },
  linen:   { waveAmp: 0.48, stiffness: 0.15, waveSpeed: 1.3 },
  wool:    { waveAmp: 0.45, stiffness: 0.25, waveSpeed: 1.0 },
  fleece:  { waveAmp: 0.60, stiffness: 0.08, waveSpeed: 1.2 },
};

interface FabricPlaneProps {
  fabricId: string;
  position: [number, number, number];
  size?: number;
}

// Preload GSAP to avoid async delay on first hover
const gsapPromise = typeof window !== "undefined" ? import("gsap").then((m) => m.default) : null;

export function FabricPlane({ fabricId, position, size = 2.5 }: FabricPlaneProps) {
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
      t.repeat.set(1.75, 1.75);
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
      uClipHalf: { value: size / 2.0 },
      uColorMap: { value: colorMap },
      uNormalMap: { value: normalMap },
      uRoughnessMap: { value: roughnessMap },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.waveAmp, config.stiffness, config.waveSpeed, size]
  );

  // Update texture uniforms when they change
  useEffect(() => {
    uniforms.uColorMap.value = colorMap;
    uniforms.uNormalMap.value = normalMap;
    uniforms.uRoughnessMap.value = roughnessMap;
  }, [colorMap, normalMap, roughnessMap, uniforms]);

  const debugged = useRef(false);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;

    // Smooth lerp mouse position
    smoothMouse.current.lerp(targetMouse.current, 0.18);
    uniforms.uMouse.value.copy(smoothMouse.current);

    // One-time debug
    if (!debugged.current && clock.elapsedTime > 1) {
      debugged.current = true;
      const geo = meshRef.current?.geometry as unknown as { parameters?: { widthSegments?: number } };
      console.log(`[FabricPlane ${fabricId}] uTime=${uniforms.uTime.value.toFixed(2)} uWaveAmp=${uniforms.uWaveAmp.value} uHover=${uniforms.uHover.value} segments=${geo?.parameters?.widthSegments ?? '?'}`);
    }
  });

  function handlePointerMove(e: THREE.Intersection) {
    if (e.uv) {
      targetMouse.current.set(e.uv.x, e.uv.y);
    }
  }

  async function handlePointerEnter() {
    const gsap = await gsapPromise;
    gsap?.to(uniforms.uHover, { value: 1, duration: 0.25, ease: "power2.out", overwrite: true });
  }

  async function handlePointerLeave() {
    const gsap = await gsapPromise;
    gsap?.to(uniforms.uHover, { value: 0, duration: 0.55, ease: "power2.in", overwrite: true });
    targetMouse.current.set(0.5, 0.5);
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, 0, 0]}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.intersections[0]) handlePointerMove(e.intersections[0]);
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[size * 1.10, size * 1.10, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
