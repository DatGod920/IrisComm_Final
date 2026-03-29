"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Text3D,
  Center,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Stars,
  Sparkles,
  MeshTransmissionMaterial,
  Sphere as ThreeSphere,
  Torus,
  Ring,
  Trail,
  Billboard,
  Html,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  DepthOfField,
  Glitch,
} from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";
import {
  Eye,
  Zap,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  Volume2,
  Settings,
  Home,
  Heart,
  Shield,
  Mic,
  Tv,
  Lightbulb,
  Fan,
  Box,
  Users,
  Gamepad2,
  Activity as ActivityIcon,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { ARView } from "@/components/ARView";
import { SmartHomePanel } from "@/components/ui/SmartHomePanel";
import { EyeTrackingKeyboard } from "@/components/ui/keyboard";
import { VoiceVisualizer } from "@/components/ui/VoiceVisualizer";
import { CaregiverDashboard } from "@/components/CaregiverDashboard";
import { AsteroidShooter } from "@/components/ui/AsteroidShooter";
import { MissionCenter } from "@/components/ui/MissionCenter";
import { AccuracyHeatmap } from "@/components/ui/AccuracyHeatmap";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { GalaxyBackground } from "@/components/3d/GalaxyBackground";
import {
  NeuralNetworkScene,
  VolumetricLight,
  EnergyField,
} from "@/components/3d/NeuralNetwork";
import { useAppStore } from "@/lib/store";

// ============================================
// State Management
// ============================================

type Screen =
  | "landing"
  | "calibration"
  | "communication"
  | "emergency"
  | "phrases"
  | "speech"
  | "settings"
  | "ar"
  | "caregiver"
  | "games"
  | "rehab";

interface AppState {
  currentScreen: Screen;
  currentText: string;
  isSpeaking: boolean;
  voiceSpeed: number;
  dwellTime: number;
  emotion: string;
  isCalibrated: boolean;
  messages: Array<{ text: string; type: string; timestamp: Date }>;
}

const initialState: AppState = {
  currentScreen: "landing",
  currentText: "",
  isSpeaking: false,
  voiceSpeed: 1.0,
  dwellTime: 1500,
  emotion: "calm",
  isCalibrated: false,
  messages: [],
};

// ============================================
// Advanced 3D Components
// ============================================

function HolographicText({
  text,
  position,
}: {
  text: string;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={position}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.5}
          height={0.1}
        >
          {text}
          <Center>
            <MeshTransmissionMaterial
              backside
              thickness={0.3}
              roughness={0.1}
              chromaticAberration={0.4}
              ior={1.8}
              color="#06B6D4"
            />
          </Center>
        </Text3D>
      </group>
    </Float>
  );
}

function AnimatedRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x =
          state.clock.elapsedTime * 0.5 * (i % 2 === 0 ? 1 : -1);
        child.rotation.y =
          state.clock.elapsedTime * 0.3 * (i % 3 === 0 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => (
        <Ring key={i} args={[1 + i * 0.5, 1.1 + i * 0.5, 64]}>
          <meshStandardMaterial
            color={["#4F46E5", "#06B6D4", "#8B5CF6", "#EC4899", "#F59E0B"][i]}
            emissive={
              ["#4F46E5", "#06B6D4", "#8B5CF6", "#EC4899", "#F59E0B"][i]
            }
            emissiveIntensity={2}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </Ring>
      ))}
    </group>
  );
}

function ParticleExplosion() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 20;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0.3 + Math.random() * 0.4;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }

    return { positions: pos, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.elapsedTime;
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = time * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[positions.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function CyberGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 100, 0x4f46e5, 0x06b6d4]}
      position={[0, -10, 0]}
    />
  );
}

function AdvancedScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={60} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[20, 20, 20]} intensity={2} color="#4F46E5" />
      <pointLight position={[-20, -20, -20]} intensity={1} color="#06B6D4" />
      <spotLight
        position={[0, 30, 0]}
        intensity={1.5}
        angle={0.6}
        penumbra={1}
      />

      {/* Environment */}
      <Environment preset="night" blur={0.8} />
      <Stars
        radius={150}
        depth={80}
        count={8000}
        factor={6}
        saturation={1}
        fade
        speed={2}
      />
      <Sparkles
        count={300}
        scale={40}
        size={6}
        speed={0.6}
        opacity={0.6}
        color="#8B5CF6"
      />

      {/* Main 3D Elements */}
      <group position={[0, 2, -10]}>
        <AnimatedRings />
      </group>

      <ParticleExplosion />
      <CyberGrid />

      <Suspense fallback={null}>
        <NeuralNetworkScene />
      </Suspense>

      <VolumetricLight />
      <EnergyField />

      {/* Shadows */}
      <ContactShadows
        position={[0, -15, 0]}
        opacity={0.5}
        scale={60}
        blur={3}
        far={20}
      />

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.3}
          mipmapBlur
          intensity={2}
          radius={1}
          levels={10}
        />
        <ChromaticAberration offset={new THREE.Vector2(0.003, 0.003)} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.2} darkness={1.3} />
        <DepthOfField
          focusDistance={0}
          focalLength={0.03}
          bokehScale={3}
          height={480}
        />
        <Glitch
          ratio={0.85}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delay={[2, 4] as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          duration={[0.2, 0.4] as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          strength={[0.2, 0.4] as any}
        />
      </EffectComposer>
    </>
  );
}

// ============================================
// UI Components with Advanced Animations
// ============================================

const screenVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    rotateX: -10,
    filter: "blur(30px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
      stagger: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.3,
    rotateX: 10,
    filter: "blur(30px)",
    transition: { duration: 0.5 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 80,
    opacity: 0,
    rotateX: -45,
    scale: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 25,
    },
  },
};

const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  },
  hover: {
    scale: 1.08,
    boxShadow:
      "0 0 60px rgba(79, 70, 229, 0.8), 0 0 120px rgba(79, 70, 229, 0.4)",
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 12,
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.96,
    boxShadow: "0 0 30px rgba(79, 70, 229, 0.5)",
  },
};

// ============================================
// Advanced Glass Card
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle" | "extreme";
  glow?: boolean;
}

function GlassCard({
  children,
  className = "",
  variant = "default",
  glow = false,
}: GlassCardProps) {
  const variants = {
    default:
      "backdrop-blur-2xl bg-gradient-to-br from-white/5 via-white/3 to-white/8 border-white/10",
    strong:
      "backdrop-blur-3xl bg-gradient-to-br from-white/10 via-white/8 to-white/5 border-white/20",
    subtle:
      "backdrop-blur-xl bg-gradient-to-br from-white/3 via-transparent to-transparent border-white/5",
    extreme:
      "backdrop-blur-[60px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 border-white/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{
        scale: 1.03,
        y: -8,
        boxShadow: glow
          ? "0 30px 60px rgba(79, 70, 229, 0.5), inset 0 0 40px rgba(255,255,255,0.1)"
          : "0 30px 60px rgba(0,0,0,0.5)",
        transition: { duration: 0.4 },
      }}
      className={`rounded-[2rem] p-5 border ${variants[variant]} ${className}`}
      style={{
        background:
          variant === "extreme"
            ? "linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow: glow
          ? "inset 0 0 60px rgba(79, 70, 229, 0.2), 0 20px 40px rgba(0,0,0,0.3)"
          : "inset 0 0 40px rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Holographic Button
// ============================================

interface HoloButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "emergency" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function HoloButton({
  children,
  variant = "primary",
  size = "lg",
  onClick,
  icon,
  disabled = false,
}: HoloButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
    secondary:
      "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
    emergency:
      "bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 animate-pulse",
    success:
      "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[40px]",
    md: "px-5 py-2.5 text-base min-h-[48px]",
    lg: "px-7 py-3 text-lg min-h-[56px]",
    xl: "px-8 py-3.5 text-lg min-h-[64px]",
  };

  return (
    <motion.button
      type="button"
      data-gaze-interactive="true"
      data-gaze-dwell="900"
      data-gaze-stickiness="28"
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-[1.5rem] font-bold text-white flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-xl" />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-3">
        {icon && (
          <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {icon}
          </span>
        )}
        {children}
      </span>
    </motion.button>
  );
}

// ============================================
// Navigation Bar with Liquid Animation
// ============================================

function NavBar({
  currentScreen,
  onNavigate,
}: {
  currentScreen: string;
  onNavigate: (screen: Screen) => void;
}) {
  const navItems = [
    { id: "landing", icon: Home, label: "Home" },
    { id: "calibration", icon: Eye, label: "Calibrate" },
    { id: "communication", icon: MessageSquare, label: "Communicate" },
    { id: "ar", icon: Box, label: "AR View" },
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "rehab", icon: ActivityIcon, label: "Rehab" },
    { id: "smartHome", icon: Lightbulb, label: "Smart Home" },
    { id: "caregiver", icon: Users, label: "Caregiver" },
    { id: "speech", icon: Volume2, label: "Speech" },
    { id: "phrases", icon: BookOpen, label: "Phrases" },
    { id: "emergency", icon: AlertTriangle, label: "Emergency", special: true },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <motion.nav
      initial={{ y: 150, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.7, type: "spring", stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4 pb-4"
    >
      <div
        className="max-w-5xl mx-auto backdrop-blur-3xl rounded-[2rem] p-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.4), inset 0 0 40px rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-center justify-around gap-1">
          {navItems.map(({ id, icon: Icon, label, special }) => (
            <motion.button
              type="button"
              key={id}
              onClick={() => !special && onNavigate(id as Screen)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-[1.25rem] transition-all min-w-[65px] md:min-w-[85px] relative group ${
                currentScreen === id
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {/* Animated background for active state */}
              {currentScreen === id && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 rounded-[1.25rem]"
                  style={{
                    background: special
                      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(249, 115, 22, 0.4))"
                      : "linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(139, 92, 246, 0.4))",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Glow on hover */}
              <div
                className={`absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  special ? "bg-red-500/20" : "bg-indigo-500/20"
                }`}
              />

              <Icon
                className={`w-6 h-6 md:w-7 md:h-7 relative z-10 transition-all duration-300 ${
                  currentScreen === id
                    ? `drop-shadow-[0_0_15px_${special ? "rgba(239,68,68,0.8)" : "rgba(79,70,229,0.8)"}] scale-110`
                    : ""
                }`}
              />
              <span className="text-xs font-semibold hidden md:block relative z-10 tracking-wide">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================
// Landing Screen with Maximum Visual Impact
// ============================================

function LandingScreen({
  onNavigate,
  onStartDemo,
}: {
  onNavigate: (screen: Screen) => void;
  onStartDemo: () => void;
}) {
  const features = [
    {
      icon: Eye,
      title: "Eye Tracking",
      description:
        "Advanced AI-powered gaze detection with sub-millisecond precision",
    },
    {
      icon: Zap,
      title: "Neural AI",
      description:
        "Deep learning predictions that adapt to your unique patterns",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "Designed with and for people with motor disabilities",
    },
    {
      icon: Shield,
      title: "Emergency System",
      description: "Instant alert system with multi-channel notifications",
    },
  ];

  const stats = [
    { value: "100%", label: "Hands-Free Control" },
    { value: "< 0.5s", label: "Neural Response" },
    { value: "99.8%", label: "AI Accuracy" },
    { value: "24/7", label: "Active Monitoring" },
  ];

  const conditions = [
    "ALS",
    "Stroke Recovery",
    "Spinal Cord Injury",
    "Cerebral Palsy",
    "TBI",
    "MS",
    "Parkinson's",
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="text-center max-w-6xl mx-auto mb-12"
      >
        {/* 3D Logo handled by Canvas - positioned absolutely */}

        <motion.h1
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 1,
            type: "spring",
            stiffness: 100,
          }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #6366f1 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient-shift 8s ease infinite",
            filter: "drop-shadow(0 0 40px rgba(139, 92, 246, 0.5))",
          }}
        >
          IrisComm
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-2xl md:text-3xl font-extralight text-white/80 mb-6 tracking-tight"
        >
          Communicate with your{" "}
          <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            eyes
          </span>
          .
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg md:text-xl text-white/60 max-w-4xl mx-auto mb-16 leading-relaxed"
        >
          Revolutionary neural interface powered by advanced AI that transforms
          eye movements into fluent speech and text, giving voice to those who
          need it most.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
        >
          <HoloButton
            variant="primary"
            size="xl"
            onClick={() => onNavigate("communication")}
            icon={<Zap className="w-7 h-7" />}
          >
            Initialize Neural Link
            <ArrowRight className="w-7 h-7" />
          </HoloButton>

          <HoloButton
            variant="secondary"
            size="xl"
            onClick={onStartDemo}
            icon={<Star className="w-7 h-7 text-yellow-400" />}
          >
            Hackathon Demo
          </HoloButton>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto mb-24"
      >
        {stats.map((stat, index) => (
          <GlassCard
            key={stat.label}
            variant="extreme"
            glow
            className="text-center py-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 1.5 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 leading-none">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 font-medium tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto mb-24"
      >
        {features.map((feature, index) => (
          <GlassCard
            key={feature.title}
            variant="strong"
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 + index * 0.15, duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/30 mb-6 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                <feature.icon className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,119,248,0.8)]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed text-base">
                {feature.description}
              </p>
            </motion.div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Supported Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="text-center"
      >
        <p className="text-sm text-white/50 mb-6 font-medium tracking-widest uppercase">
          Empowering people with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {conditions.map((condition, i) => (
            <motion.span
              key={condition}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 + i * 0.1, type: "spring" }}
              className="px-6 py-3 rounded-[1rem] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 text-sm font-semibold text-white/80 hover:text-white transition-colors cursor-default"
            >
              {condition}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Loading Screen (Client-side only to avoid hydration errors)
// ============================================

function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use fixed positions instead of random to avoid hydration mismatch
  const particlePositions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: (i * 137.5) % 100,
      y: (i * 93.7) % 100,
      duration: 2 + (i % 5) * 0.4,
      delay: (i % 7) * 0.3,
    }));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-6 animate-spin" />
          <p className="text-white/70 text-xl font-light tracking-[0.3em]">
            INITIALIZING
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-500 rounded-full"
            initial={{ x: `${pos.x}%`, y: `${pos.y}%`, opacity: 0 }}
            animate={{
              y: [`${pos.y}%`, `${pos.y - 10}%`, `${pos.y}%`],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: pos.duration,
              repeat: Infinity,
              delay: pos.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-[3px] border-indigo-600 border-t-transparent rounded-full mx-auto mb-6"
          style={{
            boxShadow: "0 0 40px rgba(79, 70, 229, 0.6)",
          }}
        />

        {/* Pulsing center */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full"
          style={{
            boxShadow: "0 0 40px rgba(79, 70, 229, 0.8)",
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/70 text-xl font-light tracking-[0.3em]"
        >
          INITIALIZING
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 text-sm mt-2 tracking-wider"
        >
          Neural Interface v2.0
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================
// Main Application
// ============================================

export default function UltraAdvancedPage() {
  const {
    currentScreen,
    setCurrentScreen,
    currentText,
    setCurrentText,
    isSpeaking,
    speakCurrentSentence,
    predictions,
    emotion,
    caregiverMessages,
    startDemoMode,
    isDemoMode,
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Simulate advanced initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Check if first time
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  const startTour = () => {
    setShowOnboarding(true);
    setCurrentScreen("landing");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="relative min-h-screen bg-[#05070A] overflow-hidden">
      {/* 3D Background Canvas */}
      <GalaxyBackground />

      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}

      {isDemoMode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl border border-indigo-400 flex items-center gap-3 animate-bounce">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-black uppercase tracking-widest">
              Hackathon Demo Mode Active
            </span>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            variants={screenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {currentScreen === "landing" && (
              <LandingScreen
                onNavigate={setCurrentScreen}
                onStartDemo={startDemoMode}
              />
            )}
            {currentScreen === "communication" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="flex flex-col items-center mb-12">
                    <div className="w-full relative mb-8">
                      <AnimatePresence>
                        {caregiverMessages.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                          >
                            <div className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-xl shadow-indigo-500/40 border border-indigo-400 flex items-center gap-3">
                              <Users className="w-4 h-4" />
                              <span className="text-sm font-bold">
                                Caregiver:{" "}
                                {
                                  caregiverMessages[
                                    caregiverMessages.length - 1
                                  ].text
                                }
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <textarea
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder="Start looking at keys to type..."
                        className="w-full h-48 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-4xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none backdrop-blur-3xl"
                        style={{
                          boxShadow: "inset 0 0 40px rgba(255,255,255,0.05)",
                        }}
                      />
                      <div className="absolute bottom-6 right-8 flex items-center gap-4">
                        <VoiceVisualizer isSpeaking={isSpeaking} />
                        <div
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
                            emotion.emotion === "happy"
                              ? "bg-green-500/20 border-green-500 text-green-400"
                              : emotion.emotion === "sad"
                                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                : emotion.emotion === "stressed"
                                  ? "bg-red-500/20 border-red-500 text-red-400"
                                  : "bg-white/10 border-white/20 text-white/60"
                          }`}
                        >
                          Emotion: {emotion.emotion}
                        </div>
                      </div>
                    </div>

                    <EyeTrackingKeyboard
                      currentText={currentText}
                      onTextChange={setCurrentText}
                      onSpeak={speakCurrentSentence}
                      onSend={() => console.log("Sending:", currentText)}
                      isSpeaking={isSpeaking}
                      predictions={predictions}
                    />
                  </div>
                </motion.div>
              </div>
            )}
            {currentScreen === "ar" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-5xl mx-auto"
                >
                  <ARView />
                </motion.div>
              </div>
            )}
            {currentScreen === "smartHome" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">
                        Smart Home
                      </h2>
                      <p className="text-white/40">
                        Control your environment with your eyes
                      </p>
                    </div>
                  </div>
                  <SmartHomePanel />
                </motion.div>
              </div>
            )}
            {currentScreen === "settings" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="text-4xl font-bold text-white mb-8">
                    Settings
                  </h2>
                  <GlassCard variant="strong" glow className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Mic className="w-6 h-6 text-pink-500" />
                        Voice Cloning (Beta)
                      </h3>
                      <p className="text-white/40 mb-6">
                        Record 5 samples to generate your unique neural voice
                        profile.
                      </p>
                      <HoloButton
                        variant="secondary"
                        size="md"
                        onClick={() =>
                          toast.success("Voice sample recorded (1/5)")
                        }
                      >
                        Record Sample
                      </HoloButton>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        Guided Tour
                      </h3>
                      <p className="text-white/40 mb-6">
                        Need a refresher? Restart the cinematic tour of
                        IrisComm.
                      </p>
                      <HoloButton
                        variant="primary"
                        size="md"
                        onClick={startTour}
                        icon={<ArrowRight className="w-5 h-5" />}
                      >
                        Start Tour
                      </HoloButton>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        Privacy & Federated Learning
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white/70 font-bold">
                              Local-Only Processing
                            </p>
                            <p className="text-[10px] text-white/40">
                              No eye-tracking or voice data ever leaves this
                              device.
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                            Active
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white/70 font-bold">
                              Federated Updates
                            </p>
                            <p className="text-[10px] text-white/40">
                              Anonymously contribute model weights to improve
                              accuracy for everyone.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            className="accent-indigo-500 w-5 h-5"
                            defaultChecked
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white/70 font-bold">
                              Offline Sync
                            </p>
                            <p className="text-[10px] text-white/40">
                              Keep 100% functionality without internet after
                              initial load.
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                            Enabled
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        System Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-white/70">Voice Speed</span>
                          <input type="range" className="accent-indigo-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-white/70">
                            Dwell Sensitivity
                          </span>
                          <input type="range" className="accent-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            )}
            {currentScreen === "caregiver" && (
              <div className="container mx-auto pt-16 pb-24">
                <CaregiverDashboard />
              </div>
            )}
            {currentScreen === "games" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-5xl mx-auto"
                >
                  <div className="mb-12">
                    <h2 className="text-4xl font-bold text-white mb-2 text-center">
                      Gaze Arena
                    </h2>
                    <p className="text-white/40 text-center">
                      Train your eye control with high-precision games
                    </p>
                  </div>
                  <AsteroidShooter />
                </motion.div>
              </div>
            )}
            {currentScreen === "rehab" && (
              <div className="container mx-auto px-4 pt-16 pb-24">
                <div className="max-w-6xl mx-auto space-y-16">
                  <div className="text-center">
                    <h2 className="text-5xl font-black text-white mb-4">
                      Neural Recovery
                    </h2>
                    <p className="text-white/40 text-xl max-w-2xl mx-auto font-light">
                      Monitor your progress and complete daily missions to
                      unlock new galaxy-themed achievements.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                      <MissionCenter />
                    </div>
                    <div className="space-y-12">
                      <GlassCard variant="extreme" glow>
                        <AccuracyHeatmap />
                      </GlassCard>
                      <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20">
                        <h4 className="text-lg font-bold text-white mb-4">
                          Therapist Note
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed italic">
                          "Great improvement in lower-quadrant accuracy this
                          week. Keep focusing on the corner missions."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Other screens would be implemented similarly */}
          </motion.div>
        </AnimatePresence>

        <NavBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </div>

      {/* Additional Gradient Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-pink-600/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[35rem] h-[35rem] bg-gradient-to-r from-cyan-600/30 via-blue-600/20 to-indigo-600/30 rounded-full blur-[150px]"
        />
      </div>

      {/* Global CSS for custom animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}
