
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles, X, MessageSquareQuote } from "lucide-react";
import { useTheme } from "../ThemeContext";

/* -------------------------------------------------------------------------
   Modern 3D AI Chatbot Companion Model
   ------------------------------------------------------------------------- */
function ModernChatbotMesh({ accentColor, isHovered }) {
  const headRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const wavePulsarRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * 0.4;
    const mouseY = state.pointer.y * 0.3;

    // Follows mouse angle slightly with friendly idle head tilts
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        mouseX + Math.sin(t * 1.5) * 0.1,
        4,
        delta
      );
      headRef.current.rotation.x = THREE.MathUtils.damp(
        headRef.current.rotation.x,
        -mouseY + Math.cos(t * 1.2) * 0.08,
        4,
        delta
      );
    }

    // Natural eye blink every ~4 seconds
    const blinkCycle = Math.sin(t * 1.6);
    const blinkScale = blinkCycle > 0.95 ? 0.15 : 1;
    if (eyeLeftRef.current && eyeRightRef.current) {
      eyeLeftRef.current.scale.y = blinkScale;
      eyeRightRef.current.scale.y = blinkScale;
    }

    // Audio/thinking wave ring oscillation
    if (wavePulsarRef.current) {
      wavePulsarRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
    }
  });

  return (
    <group ref={headRef} position={[0, -0.05, 0]}>
      {/* Bot Outer Chassis Head - Clean Rounded Shell */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.3, 1.1, 1.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Glossy Black Visor / Face Display Screen */}
      <mesh position={[0, 0.1, 0.51]}>
        <boxGeometry args={[1.1, 0.85, 0.04]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Expressive Glowing Eyes */}
      <mesh ref={eyeLeftRef} position={[-0.28, 0.16, 0.54]}>
        <capsuleGeometry args={[0.08, 0.12, 4, 16]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={3} color={accentColor} />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.28, 0.16, 0.54]}>
        <capsuleGeometry args={[0.08, 0.12, 4, 16]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={3} color={accentColor} />
      </mesh>

      {/* Smiling Audio Wave / Speech Interface Bar */}
      <mesh ref={wavePulsarRef} position={[0, -0.14, 0.54]}>
        <boxGeometry args={[0.42, 0.05, 0.02]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={2.5} color={accentColor} />
      </mesh>

      {/* Cyber Communication Headphones / Ear Audio Pods */}
      <group position={[-0.72, 0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </group>
      <mesh position={[-0.8, 0.1, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial emissive="#10b981" emissiveIntensity={2.5} color="#10b981" />
      </mesh>

      <group position={[0.72, 0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </group>
      <mesh position={[0.8, 0.1, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial emissive="#10b981" emissiveIntensity={2.5} color="#10b981" />
      </mesh>

      {/* Floating Magnetic Collar Ring */}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.05, 16, 32]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={1.8} color={accentColor} />
      </mesh>

      {/* Wireless Signal Aerial on Top */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={2.8} color={accentColor} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------
   Fixed Bottom-Right Bot Gateway with Periodic 2-Minute Popup
   ------------------------------------------------------------------------- */
export default function PatrollingRobotBot({ onOpenChat }) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // 2-Minute interval popup ("I'm HardwareHub AI, any need?")
  useEffect(() => {
    // Initial friendly greeting after 4 seconds
    const initialTimer = setTimeout(() => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 7000);
    }, 4000);

    // Every 2 minutes (120,000 ms) trigger speech popup
    const interval = setInterval(() => {
      setShowBubble(true);
      // Auto-hide bubble after 7 seconds
      setTimeout(() => {
        setShowBubble(false);
      }, 7000);
    }, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const isMessageVisible = hovered || showBubble;

  return (
    <aside
      aria-label="HardwareHub AI Chatbot Assistant"
      className="fixed bottom-6 right-6 z-50 select-none flex flex-col items-end"
    >
      {/* Speech Balloon Bubble */}
      <div
        role="status"
        aria-live="polite"
        className={`relative mr-2 mb-2 max-w-[210px] rounded-2xl border ${theme.border} bg-slate-950/95 p-3 text-xs font-mono shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isMessageVisible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-3 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
            <Sparkles className="h-3 w-3" /> HardwareHub AI
          </span>
          {showBubble && !hovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              aria-label="Close message"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <p className="text-slate-200 text-[11px] leading-relaxed font-sans">
          I'm HardwareHub AI, any need?
        </p>

        {/* Small arrow down to bot */}
        <div className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-r border-b border-slate-800 bg-slate-950" />
      </div>

      {/* Clickable 3D Floating Avatar */}
      <button
        type="button"
        onClick={onOpenChat}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open HardwareHub AI Chat"
        className="relative h-28 w-28 cursor-pointer rounded-full border border-cyan-500/20 bg-slate-950/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-cyan-500/60 drop-shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center group focus:outline-none"
      >
        {/* Subtle pulsating glow halo */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: theme.accentGlow }}
        />

        <div className="h-full w-full">
          <Canvas camera={{ position: [0, 0, 2.6], fov: 42 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 3]} intensity={1.5} />
            <pointLight position={[-2, -1, 1]} color={theme.accentGlow} intensity={1.8} />
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4}>
              <ModernChatbotMesh accentColor={theme.accentGlow} isHovered={hovered} />
            </Float>
          </Canvas>
        </div>

        {/* Online Status Dot Indicator */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 px-1.5 py-0.5 shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 font-bold">AI</span>
        </div>
      </button>
    </aside>
  );
}