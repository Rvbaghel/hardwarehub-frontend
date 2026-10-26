import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import PatrollingRobotBot from "./components/PatrollingRobotBot";
import axios from "axios";
import { 
  Cpu, 
  MemoryStick, 
  Cable, 
  Zap, 
  Radio, 
  Search, 
  Bot, 
  LogOut, 
  UserCheck, 
  PenTool, 
  ExternalLink, 
  Calendar,
  Layers
} from "lucide-react";
import { useTheme, ThemeToggle } from "./ThemeContext";
import CreateBlogModal from "./components/CreateBlogModal";

const CYCLE_DURATION = 10;
const SEARCH_WINDOW = [4.5, 6.8];

const isSearchPhase = (t) => {
  const localTime = t % CYCLE_DURATION;
  return localTime >= SEARCH_WINDOW[0] && localTime < SEARCH_WINDOW[1];
};

const BENCH_PARTS = [
  { from: new THREE.Vector3(-0.55, 0.05, 0.85), to: new THREE.Vector3(-0.15, 0.045, 0.55), start: 0.6, end: 1.8, color: "#06b6d4", size: [0.16, 0.03, 0.16] },
  { from: new THREE.Vector3(0.5, 0.05, 0.9), to: new THREE.Vector3(0.05, 0.055, 0.55), start: 2.0, end: 3.2, color: "#f59e0b", size: [0.12, 0.04, 0.2] },
  { from: new THREE.Vector3(-0.45, 0.05, 0.3), to: new THREE.Vector3(-0.15, 0.045, 0.62), start: 7.0, end: 8.0, color: "#10b981", size: [0.2, 0.03, 0.1] },
  { from: new THREE.Vector3(0.45, 0.05, 0.3), to: new THREE.Vector3(0.12, 0.06, 0.62), start: 8.2, end: 9.3, color: "#06b6d4", size: [0.14, 0.05, 0.14] },
];

function Robot({ onPhaseChange, accentColor }) {
  const rootRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();
  const leftShoulderRef = useRef();
  const rightShoulderRef = useRef();
  const leftElbowRef = useRef();
  const rightElbowRef = useRef();
  const rightHandRef = useRef();
  const leftHipRef = useRef();
  const rightHipRef = useRef();
  const chestGlowRef = useRef();
  const partRefs = useRef([]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const searching = isSearchPhase(t);

    if (onPhaseChange) onPhaseChange(searching);

    if (rootRef.current) {
      const mouseX = state.pointer.x * 0.15;
      rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, mouseX, 4, delta);
      rootRef.current.position.y = -0.9 + Math.sin(t * 1.5) * 0.015;
    }

    if (torsoRef.current) {
      torsoRef.current.rotation.y = THREE.MathUtils.damp(torsoRef.current.rotation.y, searching ? -0.52 : Math.sin(t * 0.5) * 0.04, 3, delta);
      torsoRef.current.rotation.x = THREE.MathUtils.damp(torsoRef.current.rotation.x, searching ? 0 : 0.14, 3, delta);
    }

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, searching ? -0.58 : Math.sin(t * 1.2) * 0.08, 4, delta);
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, searching ? -0.1 : 0.25, 4, delta);
    }

    if (searching) {
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = THREE.MathUtils.damp(rightShoulderRef.current.rotation.x, -1.1, 3.5, delta);
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = THREE.MathUtils.damp(rightElbowRef.current.rotation.x, 1.7, 3.5, delta);
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.damp(leftShoulderRef.current.rotation.x, -0.1, 3, delta);
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = THREE.MathUtils.damp(leftElbowRef.current.rotation.x, 0.2, 3, delta);
    } else {
      const swing = Math.sin(t * 3.5);
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = THREE.MathUtils.damp(rightShoulderRef.current.rotation.x, -0.35 + swing * 0.35, 5, delta);
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = THREE.MathUtils.damp(rightElbowRef.current.rotation.x, 0.9 + Math.sin(t * 3.5 + 1) * 0.35, 5, delta);
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = THREE.MathUtils.damp(leftShoulderRef.current.rotation.x, -0.45, 4, delta);
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = THREE.MathUtils.damp(leftElbowRef.current.rotation.x, 0.95, 4, delta);
    }

    if (rightHandRef.current) {
      const grip = searching ? 1 : 0.85 + Math.sin(t * 6) * 0.15;
      rightHandRef.current.scale.x = THREE.MathUtils.damp(rightHandRef.current.scale.x, grip, 6, delta);
    }

    if (chestGlowRef.current) {
      chestGlowRef.current.intensity = 1.2 + Math.sin(t * (searching ? 1.5 : 4)) * 0.6;
    }

    const localTime = t % CYCLE_DURATION;
    BENCH_PARTS.forEach((part, i) => {
      const mesh = partRefs.current[i];
      if (!mesh) return;
      const progress = THREE.MathUtils.clamp((localTime - part.start) / (part.end - part.start), 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      mesh.position.lerpVectors(part.from, part.to, eased);
      mesh.scale.setScalar(0.5 + eased * 0.5);
    });
  });

  return (
    <group ref={rootRef} position={[0, -0.9, 0]}>
      <mesh position={[0, 0.02, 0.55]}>
        <boxGeometry args={[1.3, 0.05, 0.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
      </mesh>

      {BENCH_PARTS.map((part, i) => (
        <mesh key={i} position={part.from} ref={(el) => (partRefs.current[i] = el)}>
          <boxGeometry args={part.size} />
          <meshStandardMaterial color="#0b1329" emissive={part.color} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.18, 0.28]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>

      <group ref={leftHipRef} position={[-0.16, 0.55, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.44, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.46, 0.03]}>
          <boxGeometry args={[0.16, 0.07, 0.24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <group ref={rightHipRef} position={[0.16, 0.55, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.44, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.46, 0.03]}>
          <boxGeometry args={[0.16, 0.07, 0.24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <group ref={torsoRef} position={[0, 0.64, 0]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.46, 0.5, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>

        <mesh position={[0, 0.3, 0.16]}>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial emissive={accentColor} emissiveIntensity={2} color={accentColor} />
        </mesh>
        <pointLight ref={chestGlowRef} position={[0, 0.3, 0.3]} color={accentColor} intensity={1.2} distance={1.2} />

        <group ref={headRef} position={[0, 0.58, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 10]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[-0.055, 0.2, 0.125]}>
            <boxGeometry args={[0.05, 0.04, 0.02]} />
            <meshStandardMaterial emissive="#10b981" emissiveIntensity={2.5} color="#10b981" />
          </mesh>
          <mesh position={[0.055, 0.2, 0.125]}>
            <boxGeometry args={[0.05, 0.04, 0.02]} />
            <meshStandardMaterial emissive="#10b981" emissiveIntensity={2.5} color="#10b981" />
          </mesh>
        </group>

        <group ref={leftShoulderRef} position={[-0.29, 0.46, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.045, 0.4, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
          <group ref={leftElbowRef} position={[0, -0.4, 0]}>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.36, 10]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.11, 0.12, 0.1]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>

        <group ref={rightShoulderRef} position={[0.29, 0.46, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.045, 0.4, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
          <group ref={rightElbowRef} position={[0, -0.4, 0]}>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.36, 10]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
            </mesh>
            <group ref={rightHandRef} position={[0, -0.4, 0]}>
              <mesh>
                <boxGeometry args={[0.11, 0.12, 0.1]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.08, 0.03]}>
                <coneGeometry args={[0.025, 0.09, 8]} />
                <meshStandardMaterial emissive="#10b981" emissiveIntensity={2.5} color="#10b981" />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function SearchMonitor({ accentColor }) {
  const screenGlowRef = useRef();
  const monitorLightRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const searching = isSearchPhase(t);
    if (screenGlowRef.current) {
      screenGlowRef.current.material.opacity = searching ? 0.6 + Math.sin(t * 4) * 0.15 : 0.18;
    }
    if (monitorLightRef.current) {
      monitorLightRef.current.intensity = THREE.MathUtils.damp(monitorLightRef.current.intensity, searching ? 2.8 : 0.4, 4, delta);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.12} floatIntensity={0.3}>
      <group position={[-1.3, 0.55, -0.1]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.3, 10]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.64, 0.44, 0.03]} />
          <meshStandardMaterial color="#0a0f1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.018]} ref={screenGlowRef}>
          <planeGeometry args={[0.58, 0.38]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0.02]}>
          <boxGeometry args={[0.48, 0.04, 0.005]} />
          <meshStandardMaterial emissive="#10b981" emissiveIntensity={1.5} color="#10b981" />
        </mesh>
        {[0.05, -0.02, -0.09].map((y, i) => (
          <mesh key={i} position={[-0.03, y, 0.02]}>
            <boxGeometry args={[0.42 - i * 0.07, 0.02, 0.005]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}
        <pointLight ref={monitorLightRef} position={[0, 0, 0.4]} color={accentColor} intensity={0.4} distance={1.5} />
      </group>
    </Float>
  );
}

const REAL_CATEGORIES = [
  { name: "Memory", queryKey: "MEMORY", icon: MemoryStick, desc: "DRAM, NAND, EEPROM & Flash" },
  { name: "Connectors", queryKey: "CONNECTORS", icon: Cable, desc: "USB-C, PCIe, Ribbon & Headers" },
  { name: "Microcontrollers", queryKey: "MICROCONTROLLERS", icon: Cpu, desc: "ARM Cortex, ESP32 & MCUs" },
  { name: "Power Modules", queryKey: "POWER MODULES", icon: Zap, desc: "Buck converters, LDOs & Regulators" },
  { name: "Sensors", queryKey: "SENSORS", icon: Radio, desc: "IMUs, Environmental & Optical" },
];

export default function HomePage({ onNavigateAuth, currentUser, onLogout,onSelectBlog,onOpenChat }) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Live Blogs & Filtering State
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBlogs = (catName) => {
    setLoadingBlogs(true);
    const endpoint = catName
      ? `https://hardwarehub-project.onrender.com/api/blogs/category/${encodeURIComponent(catName)}`
      : "https://hardwarehub-project.onrender.com/api/blogs";

    axios
      .get(endpoint)
      .then((res) => {
        setBlogs(res.data);
        setLoadingBlogs(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoadingBlogs(false);
      });
  };

  useEffect(() => {
    fetchBlogs(selectedCategory);
  }, [selectedCategory]);

  // Client-side text search filter
  const filteredBlogs = blogs.filter((blog) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(query) ||
      blog.content?.toLowerCase().includes(query) ||
      blog.manufacturer?.toLowerCase().includes(query) ||
      blog.primaryUseCases?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-500`}>
      {/* 1. Header with Dynamic User Session State */}
      <header className={`sticky top-0 z-50 border-b ${theme.border} ${theme.headerBg} backdrop-blur-md transition-colors`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${theme.badgeBorder}`}>
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-wider">
              Hardware<span style={{ color: theme.dotColor }}>Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Write Post Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${theme.accentBtn} text-xs font-mono font-semibold transition-all`}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>Write Post</span>
                </button>

                {/* Profile Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} bg-slate-900/60 font-mono text-xs`}>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">@{currentUser.username}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onNavigateAuth?.("login")}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    theme.mode === "light" ? "text-slate-700 hover:text-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigateAuth?.("signup")}
                  className={`rounded-lg ${theme.accentBtn} px-4 py-2 text-sm font-semibold shadow-md transition-all`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <div
          className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full blur-[120px] transition-colors duration-700"
          style={{ backgroundColor: `${theme.dotColor}18` }}
        />

        <div className="mx-auto grid max-w-7xl px-6 lg:grid-cols-2 lg:items-center gap-12">
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full border ${theme.badgeBorder} px-3.5 py-1 text-xs font-mono`}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.dotColor }} />
              Hardware Documentation & Sourcing
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
              Know where it’s used. <br />
              <span className={`bg-gradient-to-r ${theme.taglineGradient} bg-clip-text text-transparent`}>
                Know where to buy it.
              </span>
            </h1>

            <p className={`mt-5 text-base ${theme.textSecondary} leading-relaxed max-w-xl`}>
              A curated knowledge platform for real electronic components. Learn primary industrial use cases, active manufacturers, pinout insights, and verified direct purchase links.
            </p>

            {/* Search Input Box */}
            <div className={`mt-8 flex items-center gap-3 rounded-xl border ${theme.border} ${theme.cardBg} p-2 backdrop-blur-md shadow-sm transition-all`}>
              <Search className="ml-2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components, categories, or keywords..."
                className={`w-full bg-transparent text-sm ${theme.textPrimary} placeholder:text-slate-400 focus:outline-none`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 3D Canvas Box */}
          <div className={`relative h-[420px] sm:h-[480px] w-full rounded-2xl border ${theme.border} ${
            theme.mode === "light" ? "bg-slate-900 shadow-xl" : "bg-slate-950/40 backdrop-blur-md"
          } overflow-hidden flex flex-col justify-between p-4`}>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 z-10">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.dotColor }} />
                SYSTEM // {isSearching ? "DOCUMENTATION_LOOKUP" : "BENCH_ASSEMBLY"}
              </span>
              <span
                className="px-2 py-0.5 rounded border text-[10px] font-semibold"
                style={{ borderColor: `${theme.dotColor}66`, color: theme.dotColor, backgroundColor: `${theme.dotColor}1A` }}
              >
                {isSearching ? "LOOKING UP PINOUTS" : "BUILDING HARDWARE"}
              </span>
            </div>

            <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
              <Canvas camera={{ position: [0, 1.1, 3.6], fov: 40 }}>
                <ambientLight intensity={theme.mode === "light" ? 0.85 : 0.65} />
                <directionalLight position={[3, 6, 4]} intensity={1.4} />
                <pointLight position={[-2.5, 1.5, 1]} intensity={1.5} color={theme.accentGlow} />
                <pointLight position={[2, 0.5, -1]} intensity={1.0} color="#10b981" />
                
                <Robot onPhaseChange={setIsSearching} accentColor={theme.accentGlow} />
                <SearchMonitor accentColor={theme.accentGlow} />

                <OrbitControls 
                  enableZoom={false} 
                  maxPolarAngle={Math.PI / 2 + 0.1} 
                  minPolarAngle={Math.PI / 3}
                  enablePan={false}
                />
              </Canvas>
            </div>

            <div className="z-10 text-center font-mono text-[11px] text-slate-400">
              Click & drag to inspect work bay • Autonomous agent syncs live with documentation
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hardware Categories Section */}
      <section className={`border-t ${theme.border} py-16 transition-colors`}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-xl font-bold tracking-tight">Hardware Categories</h2>
          <p className={`mt-1 text-sm ${theme.textSecondary}`}>
            Select a category to filter live technical blogs and component records.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {REAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.queryKey;
              return (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.queryKey)}
                  className={`group rounded-xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${
                    isSelected 
                      ? "border-cyan-500 bg-cyan-500/10 shadow-lg" 
                      : `${theme.border} ${theme.cardBg}`
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border} ${
                    theme.mode === "light" ? "bg-white text-slate-800" : "bg-slate-900 text-slate-200"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-sm flex items-center justify-between">
                    {cat.name}
                    {isSelected && <span className="text-[10px] text-cyan-400 font-mono">ACTIVE</span>}
                  </h3>
                  <p className={`mt-1 text-xs ${theme.textSecondary}`}>{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. LIVE HARDWARE BLOGS FEED */}
      <section className={`border-t ${theme.border} py-16`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <h2 className="text-2xl font-bold tracking-tight">Technical Hardware Write-ups</h2>
              </div>
              <p className={`mt-1 text-sm ${theme.textSecondary}`}>
                Engineering breakdowns, pin multiplexing, and direct purchase channels.
              </p>
            </div>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors"
              >
                Category: {selectedCategory} ✕ (Clear)
              </button>
            )}
          </div>

          {loadingBlogs ? (
            <div className="text-center py-16 font-mono text-sm text-slate-500">
              <span className="inline-block h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
              Loading silicon records...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className={`p-12 rounded-2xl border ${theme.border} ${theme.cardBg} text-center font-mono text-sm text-slate-400`}>
              No hardware write-ups match this criteria. {currentUser ? "Publish the first article!" : "Sign up and write one!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className={`rounded-2xl border ${theme.border} ${theme.cardBg} overflow-hidden flex flex-col justify-between p-5 hover:border-slate-500/60 transition-all duration-300 shadow-sm`}
                >
                  <div>
                    {/* Primary Image preview */}
                    {blog.imageUrls && blog.imageUrls.length > 0 && (
                      <div className="h-44 -mx-5 -mt-5 mb-4 overflow-hidden border-b border-slate-800 bg-slate-950">
                        <img
                          src={blog.imageUrls[0]}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    )}

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                        {blog.categoryName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{blog.manufacturer}</span>
                    </div>

                    <h3 className="font-bold text-base leading-snug mb-2.5">{blog.title}</h3>
                    
                    <p className={`text-xs ${theme.textSecondary} line-clamp-3 mb-4 leading-relaxed`}>
                      {blog.content}
                    </p>

                    {/* Primary Use Cases */}
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-4 text-[11px] font-mono text-slate-300">
                      <span className="text-slate-500">Target Applications: </span>{blog.primaryUseCases}
                    </div>
                  </div>
                  {/* Read Full Blog Action Button */}
<button
  onClick={() => onSelectBlog?.(blog.id)}
  className={`w-full mb-3 py-2 rounded-lg border ${theme.border} bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-1.5`}
>
  <span>Read Full Blog</span>
  <span>→</span>
</button>


                  {/* Card Footer */}
                  <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      @{blog.authorUsername}
                    </span>

                    {blog.purchaseLink ? (
                      <a
                        href={blog.purchaseLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                      >
                        Buy Silicon <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">No Buy Link</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Chatboard Teaser */}
      <section className={`border-t ${theme.border} py-16 ${theme.mode === "light" ? "bg-slate-100/60" : "bg-slate-950/50"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className={`rounded-2xl border ${theme.border} ${theme.cardBg} p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${theme.badgeBorder}`}>
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <span className={`rounded-md border ${theme.badgeBorder} px-2 py-0.5 font-mono text-[10px]`}>
                  PHASE 2 INTEGRATION
                </span>
                <h3 className="mt-2 text-lg font-bold">Hardware Chatboard Assistant</h3>
                <p className={`mt-1 text-sm ${theme.textSecondary} max-w-xl`}>
                  Ask questions about logic levels, pinouts, and recommended voltage regulators based on our indexed hardware blogs.
                </p>
              </div>
            </div>
            <button className={`rounded-lg border ${theme.border} px-4 py-2.5 text-xs font-mono cursor-not-allowed opacity-70 ${
              theme.mode === "light" ? "bg-slate-200 text-slate-600" : "bg-slate-800 text-slate-300"
            }`}>
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className={`border-t ${theme.border} py-8 text-center text-xs ${theme.textSecondary} font-mono transition-colors`}>
        &copy; {new Date().getFullYear()} HardwareHub. Spring Boot + React Architecture.
      </footer>

      {/* 7. Publishing Modal */}
      <CreateBlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onBlogCreated={(newBlog) => setBlogs((prev) => [newBlog, ...prev])}
      />

      {/* 3D Corner-Patrolling Assistant Gateway */}
      <PatrollingRobotBot onOpenChat={onOpenChat} />
    
    </div>
  );
}