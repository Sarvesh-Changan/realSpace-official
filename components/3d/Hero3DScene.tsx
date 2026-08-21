"use client";

import React, { useRef, useState, useEffect, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * Brand & Warm Interior Palette
 * Kunku Red Accent: #990000 / #B83A3A
 * Halad Yellow Accent: #FECC00
 * Warm Wood / Neutrals: #F8F5F1, #EEE8E0, #D4C5B9, #5C4033, #C2B280
 * Sage Green Plant: #3A5F0B, #4C7812
 */

// --- Static Fallback Placeholder ---
export function Hero3DFallback() {
  return (
    <div className="w-full h-full min-h-[350px] lg:min-h-[500px] rounded-3xl bg-gradient-to-tr from-[#990000]/10 via-[#FECC00]/10 to-[#F8F5F1] border border-[#E8E2DA] flex items-center justify-center p-8 relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      <div className="relative z-10 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/80 backdrop-blur border border-[#E8E2DA] flex items-center justify-center shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#990000]" />
        </div>
        <p className="text-sm font-medium text-neutral-500">REALSPACE Isometric Room Studio</p>
      </div>
    </div>
  );
}

// --- React Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Hero3DScene WebGL or Render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ----------------------------------------------------------------------
// Isometric Room Cutaway Diorama
// ----------------------------------------------------------------------

function RoomDiorama() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. ROOM SHELL (Open-Corner Dollhouse: Floor + Back Wall + Left Wall) */}
      
      {/* Parquet/Tile Floor (1 mesh) */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[4.2, 0.15, 4.2]} />
        <meshStandardMaterial color="#E8E2DA" roughness={0.7} />
      </mesh>

      {/* Back Wall (1 mesh) */}
      <mesh position={[0, 0.4, -2.1]}>
        <boxGeometry args={[4.2, 2.45, 0.1]} />
        <meshStandardMaterial color="#F8F5F1" roughness={0.8} />
      </mesh>

      {/* Left Side Wall (1 mesh) */}
      <mesh position={[-2.1, 0.4, 0]}>
        <boxGeometry args={[0.1, 2.45, 4.2]} />
        <meshStandardMaterial color="#EEE8E0" roughness={0.8} />
      </mesh>

      {/* Baseboard Detail along Back Wall (1 mesh) */}
      <mesh position={[0, -0.78, -2.03]}>
        <boxGeometry args={[4.1, 0.1, 0.04]} />
        <meshStandardMaterial color="#D4C5B9" roughness={0.6} />
      </mesh>

      {/* 2. FURNITURE & DECOR PIECES */}

      {/* --- A. Sofa against Back Wall (6 meshes) --- */}
      <group position={[-0.4, -0.5, -1.3]}>
        {/* Seat Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 0.3, 0.9]} />
          <meshStandardMaterial color="#990000" roughness={0.6} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.55, -0.35]}>
          <boxGeometry args={[2.0, 0.8, 0.2]} />
          <meshStandardMaterial color="#800000" roughness={0.6} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-1.05, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.9]} />
          <meshStandardMaterial color="#730000" roughness={0.6} />
        </mesh>
        <mesh position={[1.05, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.9]} />
          <meshStandardMaterial color="#730000" roughness={0.6} />
        </mesh>
        {/* Cream & Yellow Cushions */}
        <mesh position={[-0.5, 0.22, 0.05]}>
          <boxGeometry args={[0.8, 0.16, 0.7]} />
          <meshStandardMaterial color="#F8F5F1" roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 0.22, 0.05]}>
          <boxGeometry args={[0.8, 0.16, 0.7]} />
          <meshStandardMaterial color="#FECC00" roughness={0.5} />
        </mesh>
      </group>

      {/* --- B. Coffee Table in front of Sofa (6 meshes) --- */}
      <group position={[-0.4, -0.68, -0.2]}>
        {/* Tabletop */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.08, 0.85]} />
          <meshStandardMaterial color="#D4C5B9" roughness={0.4} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.65, -0.2, -0.33]}>
          <cylinderGeometry args={[0.035, 0.035, 0.32, 12]} />
          <meshStandardMaterial color="#5C4033" roughness={0.7} />
        </mesh>
        <mesh position={[0.65, -0.2, -0.33]}>
          <cylinderGeometry args={[0.035, 0.035, 0.32, 12]} />
          <meshStandardMaterial color="#5C4033" roughness={0.7} />
        </mesh>
        <mesh position={[-0.65, -0.2, 0.33]}>
          <cylinderGeometry args={[0.035, 0.035, 0.32, 12]} />
          <meshStandardMaterial color="#5C4033" roughness={0.7} />
        </mesh>
        <mesh position={[0.65, -0.2, 0.33]}>
          <cylinderGeometry args={[0.035, 0.035, 0.32, 12]} />
          <meshStandardMaterial color="#5C4033" roughness={0.7} />
        </mesh>
        {/* Tray / Book Accent */}
        <mesh position={[0.2, 0.06, 0]}>
          <boxGeometry args={[0.35, 0.04, 0.25]} />
          <meshStandardMaterial color="#990000" roughness={0.5} />
        </mesh>
      </group>

      {/* --- C. Corner Plant (4 meshes) --- */}
      <group position={[-1.5, -0.45, -1.45]}>
        {/* Terracotta Pot */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.25, 0.18, 0.38, 16]} />
          <meshStandardMaterial color="#C2B280" roughness={0.8} />
        </mesh>
        {/* Layered Foliage Cones */}
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.42, 0.5, 14]} />
          <meshStandardMaterial color="#3A5F0B" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.32, 0.42, 14]} />
          <meshStandardMaterial color="#4C7812" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.2, 0.32, 14]} />
          <meshStandardMaterial color="#5B8E17" roughness={0.7} />
        </mesh>
      </group>

      {/* --- D. Standing Lamp (3 meshes) --- */}
      <group position={[1.5, -0.1, -1.5]}>
        {/* Base */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.25, 0.28, 0.06, 16]} />
          <meshStandardMaterial color="#333333" roughness={0.4} />
        </mesh>
        {/* Pole */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.4, 12]} />
          <meshStandardMaterial color="#E8E2DA" roughness={0.2} />
        </mesh>
        {/* Lampshade (Halad Yellow Accent) */}
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.4, 0.45, 24]} />
          <meshStandardMaterial color="#FECC00" roughness={0.4} />
        </mesh>
      </group>

      {/* --- E. Framed Wall Picture on Back Wall (2 meshes) --- */}
      <group position={[0.4, 0.8, -2.03]}>
        {/* Outer Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshStandardMaterial color="#5C4033" roughness={0.5} />
        </mesh>
        {/* Recessed Art Canvas */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[1.04, 0.74, 0.02]} />
          <meshStandardMaterial color="#F8F5F1" roughness={0.9} />
        </mesh>
      </group>

      {/* --- F. TV Unit & Stand (3 meshes) --- */}
      <group position={[1.4, -0.45, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Cabinet Stand */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.4, 0.35, 0.45]} />
          <meshStandardMaterial color="#5C4033" roughness={0.6} />
        </mesh>
        {/* TV Screen */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 0.7, 0.04]} />
          <meshStandardMaterial color="#222222" roughness={0.2} />
        </mesh>
        {/* TV Base Stand */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.2]} />
          <meshStandardMaterial color="#333333" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ----------------------------------------------------------------------
// Main 3D Scene Component
// ----------------------------------------------------------------------

export default function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // 1. Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  // 2. Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 3. Intersection Observer (pause animation when scrolled out of view)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldAnimate = isTabVisible && isInView;

  if (prefersReducedMotion) {
    return <Hero3DFallback />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative rounded-3xl overflow-hidden border border-[#E8E2DA] bg-[#F8F5F1] group cursor-grab active:cursor-grabbing select-none">
      <SceneErrorBoundary fallback={<Hero3DFallback />}>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={shouldAnimate ? "always" : "never"}
          gl={{ powerPreference: "high-performance", antialias: true, alpha: true }}
        >
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[5.2, 4.2, 5.2]} fov={38} />

          {/* Mouse / Pointer Interactive Orbit Controls */}
          <OrbitControls
            makeDefault
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.6}
            minDistance={3}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={0.1}
            target={[0, 0, 0]}
          />

          {/* Cozy Room Lighting: Ambient + Warm Directional + Warm Lamp Point Light */}
          <ambientLight intensity={0.85} color="#FFF9F2" />
          <directionalLight position={[6, 12, 6]} intensity={1.2} color="#FFFDF5" />
          <pointLight position={[1.5, 0.6, -1.5]} intensity={0.6} color="#FFE8B3" distance={4} />

          {/* Room Cutaway Diorama */}
          <RoomDiorama />
        </Canvas>
      </SceneErrorBoundary>

    </div>
  );
}
