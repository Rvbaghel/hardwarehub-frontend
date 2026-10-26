import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";
import { 
  Cpu, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  LockKeyhole 
} from "lucide-react";
import { useTheme, ThemeToggle } from "../ThemeContext";

/* -------------------------------------------------------------------------
   3D Secure Element & Laser Credential Scanner
   ------------------------------------------------------------------------- */
function SecureElementChip({ accentColor, isAuthenticating }) {
  const groupRef = useRef();
  const scannerBeamRef = useRef();
  const coreGlowRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * 0.35;
    const mouseY = state.pointer.y * 0.35;

    // Smooth whole chip tilt towards mouse
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        mouseX + (isAuthenticating ? t * 5 : t * 0.25),
        4,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        mouseY + 0.35 + Math.sin(t * 0.7) * 0.08,
        4,
        delta
      );
    }

    // Laser verification scan beam traveling across silicon die
    if (scannerBeamRef.current) {
      const scanSpeed = isAuthenticating ? 8 : 2.5;
      scannerBeamRef.current.position.z = Math.sin(t * scanSpeed) * 0.9;
    }

    // Center crypto engine pulsation
    if (coreGlowRef.current) {
      coreGlowRef.current.intensity = isAuthenticating
        ? 3.2 + Math.sin(t * 18) * 1.5
        : 1.6 + Math.sin(t * 3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* PCB Substrate Interposer */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[2.5, 0.08, 2.5]} />
        <meshStandardMaterial color="#064e3b" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Main Molded Silicon Package */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.1, 0.22, 2.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Exposed Cryptographic Die Window */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.3, 0.04, 1.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* Core Cryptographic Vault Light */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={2.5} color={accentColor} />
      </mesh>
      <pointLight ref={coreGlowRef} position={[0, 0.35, 0]} color={accentColor} intensity={2.0} distance={2.5} />

      {/* Laser Scanning Verification Beam */}
      <group ref={scannerBeamRef} position={[0, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 0.02, 0.06]} />
          <meshStandardMaterial emissive="#10b981" emissiveIntensity={3} color="#10b981" />
        </mesh>
        <pointLight position={[0, 0.05, 0]} color="#10b981" intensity={2} distance={1.0} />
      </group>

      {/* Perimeter BGA Solder Balls / Surface Mount Contacts */}
      {Array.from({ length: 6 }).map((_, i) => {
        const offset = -0.75 + i * 0.3;
        return (
          <group key={i}>
            <mesh position={[offset, -0.06, -1.15]}>
              <boxGeometry args={[0.14, 0.08, 0.16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[offset, -0.06, 1.15]}>
              <boxGeometry args={[0.14, 0.08, 0.16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[-1.15, -0.06, offset]}>
              <boxGeometry args={[0.16, 0.08, 0.14]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[1.15, -0.06, offset]}>
              <boxGeometry args={[0.16, 0.08, 0.14]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* -------------------------------------------------------------------------
   Login Page Component
   ------------------------------------------------------------------------- */
export default function LoginPage({ onNavigateSignup, onNavigateHome, onLoginSuccess }) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    if (!/^\d{6}$/.test(formData.password)) {
      setStatus({ 
        loading: false, 
        error: "Password must be your exact 6-digit numeric PIN.", 
        success: null 
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://hardwarehub-project.onrender.com/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      const userSession = {
        userId: response.data.userId,
        username: response.data.username,
        email: response.data.email,
      };

      setStatus({
        loading: false,
        error: null,
        success: "Authentication verified. Decrypting session...",
      });

      // Save user session and redirect to Home
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(userSession);
        } else {
          onNavigateHome?.();
        }
      }, 1000);
    } catch (err) {
      const serverMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Invalid email or password credentials.";
      setStatus({ loading: false, error: serverMessage, success: null });
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-500 flex flex-col justify-between`}>
      {/* Top Header */}
      <header className={`border-b ${theme.border} ${theme.headerBg} backdrop-blur-md px-6 py-4 flex justify-between items-center transition-colors`}>
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${theme.badgeBorder}`}>
            <Cpu className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-wider">
            Hardware<span style={{ color: theme.dotColor }}>Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={onNavigateHome}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Form (6 cols) */}
        <div className={`lg:col-span-6 rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all`}>
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 rounded-full border ${theme.badgeBorder} px-3 py-0.5 text-xs font-mono mb-3`}>
              <LockKeyhole className="h-3.5 w-3.5" />
              Secure Terminal Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Authenticate session</h1>
            <p className={`mt-1 text-xs sm:text-sm ${theme.textSecondary}`}>
              Enter your registered developer email and 6-digit cryptographic PIN.
            </p>
          </div>

          {/* Feedback Alerts */}
          {status.error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {status.success && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{status.success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">DEVELOPER EMAIL</label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@hardware.com"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>

            {/* 6-digit PIN */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono text-slate-400">6-DIGIT PIN</label>
                <span className="text-[10px] font-mono text-slate-500">NUMERIC ONLY</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                <KeyRound className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  maxLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.loading}
              className={`w-full py-2.5 rounded-lg ${theme.accentBtn} font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-50`}
            >
              {status.loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying Cryptographic PIN...
                </>
              ) : (
                <>
                  Authenticate & Launch
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${theme.border}`} /></div>
            <span className={`relative px-3 text-[11px] font-mono ${theme.cardBg} ${theme.textSecondary}`}>
              OR ACCESS WITH FEDERATED OAUTH
            </span>
          </div>

          {/* Google SSO notice */}
          <button
            type="button"
            disabled
            className={`w-full py-2.5 rounded-lg border ${theme.border} bg-slate-900/40 text-xs font-mono text-slate-400 flex items-center justify-center gap-3 cursor-not-allowed opacity-80`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.54 0 2.93.56 4.02 1.48l3.01-3.01C17.21 1.79 14.77 1 12 1 7.48 1 3.66 3.6 1.84 7.39l3.66 2.84C6.38 7.33 8.95 5 12 5z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.69 2.86c2.16-1.99 3.42-4.93 3.42-8.68z" />
              <path fill="#FBBC05" d="M5.5 14.77c-.24-.73-.38-1.5-.38-2.27s.14-1.54.38-2.27L1.84 7.39C1.1 8.87.68 10.49.68 12.2c0 1.71.42 3.33 1.16 4.81l3.66-2.24z" />
              <path fill="#34A853" d="M12 23.4c3.24 0 5.95-1.08 7.93-2.91l-3.69-2.86c-1.08.72-2.45 1.16-4.24 1.16-3.05 0-5.62-2.33-6.5-5.23L1.84 16.4C3.66 20.19 7.48 23.4 12 23.4z" />
            </svg>
            Continue with Google
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-amber-500/40 bg-amber-500/10 text-amber-400">
              In Development Phase
            </span>
          </button>

          <div className="mt-6 text-center text-xs font-mono text-slate-400">
            Need an account?{" "}
            <button
              onClick={onNavigateSignup}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Create developer identity
            </button>
          </div>
        </div>

        {/* Right Column: 3D Secure Element Scanner (6 cols) */}
        <div className={`lg:col-span-6 h-[460px] sm:h-[520px] rounded-2xl border ${theme.border} bg-slate-950/40 backdrop-blur-md overflow-hidden flex flex-col justify-between p-4 relative`}>
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 z-10">
            <span>SEC_ELEMENT // TPM_2.0</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              LASER SCAN ACTIVE
            </span>
          </div>

          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            <Canvas 
  camera={{ position: [0, 2.2, 4.0], fov: 42 }}
  gl={{ 
    powerPreference: "default", 
    antialias: true,
    preserveDrawingBuffer: false,
    alpha: true 
  }}
  onCreated={({ gl }) => {
    gl.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
    }, false);
  }}
>
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 7, 4]} intensity={1.5} />
              <pointLight position={[-3, -1, 2]} intensity={1.2} color={theme.accentGlow} />

              <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.5}>
                <SecureElementChip 
                  accentColor={theme.accentGlow} 
                  isAuthenticating={status.loading} 
                />
              </Float>

              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                maxPolarAngle={Math.PI / 1.7} 
                minPolarAngle={Math.PI / 2.8} 
              />
            </Canvas>
          </div>

          <div className="z-10 text-center font-mono text-[11px] text-slate-500">
            Encrypted hardware vault • Laser sweeps across die surface in real-time
          </div>
        </div>
      </main>

      <footer className={`border-t ${theme.border} py-6 text-center text-xs text-slate-500 font-mono`}>
        &copy; {new Date().getFullYear()} HardwareHub. Encrypted identity layer via Spring Boot.
      </footer>
    </div>
  );
}