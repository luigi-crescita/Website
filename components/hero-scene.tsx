"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Roughly matches the --brand / --brand-2 CSS tokens in globals.css.
// Hardcoded because three.js materials need actual color values, not CSS vars.
const BRAND = "#8b7cf6";
const BRAND_2 = "#4fd8c9";

const PARTICLE_COUNT = 220;

// Plain module-level helper (not a component or hook) so the random spatial
// distribution it computes doesn't trip the react-hooks purity rule — it's
// only ever invoked once, lazily, via useMemo below.
function createParticlePositions(count: number) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Distribute points in a spherical shell around the wireframe so they
    // read as ambient "dust" rather than a solid cloud.
    const radius = 1.9 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = radius * Math.cos(phi);
  }
  return arr;
}

function useReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
}

function Particles() {
  const positions = useMemo(() => createParticlePositions(PARTICLE_COUNT), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={BRAND_2}
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const baseRotation = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const pointer = useThree((state) => state.pointer);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (!reducedMotion) {
      baseRotation.current.y += delta * 0.09;
      baseRotation.current.x += delta * 0.02;
    }

    // Subtle parallax toward the pointer, eased toward a target that sits on
    // top of the ambient rotation — kept small so it reads as ambient depth,
    // not an interactive toy.
    const targetX = baseRotation.current.x + pointer.y * 0.15;
    const targetY = baseRotation.current.y + pointer.x * 0.15;
    group.rotation.x += (targetX - group.rotation.x) * 0.05;
    group.rotation.y += (targetY - group.rotation.y) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial color={BRAND} wireframe transparent opacity={0.45} />
      </mesh>
      <Particles />
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      className="!touch-none"
    >
      <Scene />
    </Canvas>
  );
}
