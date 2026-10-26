import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";
import { 
  Cpu, 
  User, 
  Mail, 
  KeyRound, 
  Phone, 
  FileText, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import { useTheme, ThemeToggle } from "../ThemeContext";

/* -------------------------------------------------------------------------
   3D Hardware Security Key (Cryptographic USB Authenticator)
   ------------------------------------------------------------------------- */
function HardwareSecurityKey({ accentColor, isSubmitting }) {
  const groupRef = useRef();
  const ledGlowRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * 0.3;
    const mouseY = state.pointer.y * 0.3;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        mouseX + (isSubmitting ? t * 4 : t * 0.4),
        4,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        mouseY + Math.sin(t * 0.8) * 0.1,
        4,
        delta
      );
    }

    if (ledGlowRef.current) {
      ledGlowRef.current.intensity = isSubmitting 
        ? 3.0 + Math.sin(t * 15) * 1.5 
        : 1.5 + Math.sin(t * 2) * 0.6;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* USB Connector Tip */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.22]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Contact Pins */}
      <mesh position={[-0.15, 1.4, 0.08]}>
        <boxGeometry args={[0.08, 0.4, 0.02]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 1.4, 0.08]}>
        <boxGeometry args={[0.08, 0.4, 0.02]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Main Enclosure Body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.3, 2.0, 0.32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Recess */}
      <mesh position={[0, 0.2, 0.17]}>
        <boxGeometry args={[0.9, 0.9, 0.04]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Gold Ring */}
      <mesh position={[0, 0.2, 0.19]}>
        <cylinderGeometry args={[0.32, 0.32, 0.03, 32]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Verification LED */}
      <mesh position={[0, 0.2, 0.21]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 24]} />
        <meshStandardMaterial emissive={accentColor} emissiveIntensity={2.5} color={accentColor} />
      </mesh>
      <pointLight ref={ledGlowRef} position={[0, 0.2, 0.4]} color={accentColor} intensity={2.0} distance={2.0} />

      {/* Keyring Loop */}
      <mesh position={[0, -1.05, 0]}>
        <torusGeometry args={[0.26, 0.07, 16, 32]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------
   Signup Page Component
   ------------------------------------------------------------------------- */
export default function SignupPage({ onNavigateLogin, onNavigateHome, onSignupSuccess }) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    mobileNumber: "",
    bio: "",
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
      setStatus({ loading: false, error: "Password must be an exact 6-digit numeric PIN (e.g., 123456).", success: null });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ loading: false, error: "Passwords do not match.", success: null });
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setStatus({ loading: false, error: "Mobile number must be a 10-digit number.", success: null });
      return;
    }

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        age: parseInt(formData.age, 10),
        mobileNumber: formData.mobileNumber.trim(),
        bio: formData.bio.trim(),
      };

      const response = await axios.post(
        "https://hardwarehub-project.onrender.com/api/auth/signup",
        payload
      );

      const userSession = {
        username: formData.username.trim(),
        email: formData.email.trim(),
      };

      setStatus({
        loading: false,
        error: null,
        success: response.data.message || "Account created! Signing you in...",
      });

      // Save user session in localStorage and redirect straight to Home
      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess(userSession);
        } else {
          onNavigateHome?.();
        }
      }, 1000);
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again.";
      setStatus({ loading: false, error: serverMessage, success: null });
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-500 flex flex-col justify-between`}>
      {/* Top Header with Theme Switcher */}
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
      <main className="max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Form */}
        <div className={`lg:col-span-7 rounded-2xl border ${theme.border} ${theme.cardBg} p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all`}>
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 rounded-full border ${theme.badgeBorder} px-3 py-0.5 text-xs font-mono mb-3`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Developer Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your engineering profile</h1>
            <p className={`mt-1 text-xs sm:text-sm ${theme.textSecondary}`}>
              Join the silicon documentation community. Write component analyses, track errata, and share pinouts.
            </p>
          </div>

          {/* Feedback Badges */}
          {status.error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {status.success && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{status.success} Redirecting to Home...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">USERNAME</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <User className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="e.g. dev_vishal"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="vishal@embedded.io"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">6-DIGIT PIN</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    maxLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">CONFIRM PIN</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    maxLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* Mobile & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">MOBILE (10 DIGITS)</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <Phone className="h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">AGE</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    name="age"
                    min="1"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    placeholder="23"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">HARDWARE INTERESTS & BIO</label>
              <div className={`flex items-start gap-2 p-3 rounded-lg border ${theme.border} bg-slate-950/40 focus-within:border-cyan-500`}>
                <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                <textarea
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="e.g. Embedded developer focused on STM32, ESP32, and high-speed PCB interconnects."
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-mono resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status.loading}
              className={`w-full py-2.5 rounded-lg ${theme.accentBtn} font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50`}
            >
              {status.loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register Identity
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${theme.border}`} /></div>
            <span className={`relative px-3 text-[11px] font-mono ${theme.cardBg} ${theme.textSecondary}`}>
              OR CONNECT WITH PROVIDERS
            </span>
          </div>

          {/* Google Sign-in Notice */}
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
            Already registered?{" "}
            <button
              onClick={onNavigateLogin}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Sign in to account
            </button>
          </div>
        </div>

        {/* Right Column: 3D Hardware Key */}
        <div className={`lg:col-span-5 h-[460px] sm:h-[540px] rounded-2xl border ${theme.border} bg-slate-950/40 backdrop-blur-md overflow-hidden flex flex-col justify-between p-4 relative`}>
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 z-10">
            <span>SEC_KEY // FIDO2_HW</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              AUTHENTICATOR READY
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
              <directionalLight position={[4, 5, 4]} intensity={1.5} />
              <pointLight position={[-3, -2, 2]} intensity={1.2} color={theme.accentGlow} />

              <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
                <HardwareSecurityKey 
                  accentColor={theme.accentGlow} 
                  isSubmitting={status.loading} 
                />
              </Float>

              <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 2.5} />
            </Canvas>
          </div>

          <div className="z-10 text-center font-mono text-[11px] text-slate-500">
            Hardware-grade cryptographic identity • Rotate key with cursor
          </div>
        </div>
      </main>

      <footer className={`border-t ${theme.border} py-6 text-center text-xs text-slate-500 font-mono`}>
        &copy; {new Date().getFullYear()} HardwareHub. Encrypted identity layer via Spring Boot.
      </footer>
    </div>
  );
}