"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  Eye,
  Zap,
  Heart,
  Shield,
  Globe,
  Wifi,
  Home as HomeIcon,
  Mic,
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Cpu,
  Database,
  Cloud,
} from "lucide-react";

// ============================================
// Advanced Particle Background
// ============================================

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x -= 0.0003;
      ref.current.rotation.y -= 0.0005;
    }
  });

  const positions = useMemo(() => {
    const particleCount = 5000;
    const nextPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const offset = i * 3;
      nextPositions[offset] = (Math.random() - 0.5) * 2;
      nextPositions[offset + 1] = (Math.random() - 0.5) * 2;
      nextPositions[offset + 2] = (Math.random() - 0.5) * 2;
    }
    return nextPositions;
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#4F46E5"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} className="pointer-events-none">
        <ParticleField />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05070A]/50 to-[#05070A]" />
    </div>
  );
}

// ============================================
// UI Components
// ============================================

const GlowingButton = ({
  children,
  variant = "primary",
  size = "lg",
  onClick,
  icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "emergency" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  icon?: React.ReactNode;
}) => {
  const variants = {
    primary:
      "from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
    secondary:
      "from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
    emergency: "from-red-600 via-orange-600 to-yellow-600 animate-pulse",
    success:
      "from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  return (
    <motion.button
      type="button"
      data-gaze-interactive="true"
      data-gaze-dwell="900"
      data-gaze-stickiness="28"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-gradient-to-r ${variants[variant]} ${sizes[size]} rounded-2xl font-bold text-white relative overflow-hidden group shadow-lg`}
      style={{
        boxShadow: "0 0 40px rgba(79, 70, 229, 0.5)",
      }}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="relative z-10 flex items-center gap-3">
        {icon && <span className="drop-shadow-lg">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

const GlassCard = ({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    whileHover={{ scale: 1.03, y: -8 }}
    className={`backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/3 to-white/8 border border-white/10 rounded-3xl p-5 ${className}`}
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
      boxShadow: glow
        ? "0 0 60px rgba(79, 70, 229, 0.3), inset 0 0 40px rgba(255,255,255,0.05)"
        : "inset 0 0 40px rgba(255,255,255,0.05)",
    }}
  >
    {children}
  </motion.div>
);

// ============================================
// Main Sections
// ============================================

const HeroSection = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section
      style={{ y, opacity }}
      className="relative min-h-[65vh] flex items-center justify-center px-4 pt-16"
    >
      {/* Animated Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-indigo-500/20 rounded-full"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 200 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center relative"
          style={{
            boxShadow: "0 0 100px rgba(79, 70, 229, 0.8)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-white/20 rounded-full"
          />
          <Eye className="w-16 h-16 text-white drop-shadow-lg" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-5xl md:text-7xl font-black mb-4 leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #6366f1 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient-shift 8s ease infinite",
          }}
        >
          IrisComm
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-2xl md:text-3xl font-light text-white/80 mb-4"
        >
          Communicate With Your{" "}
          <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Eyes
          </span>
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-base text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          AI-powered eye-controlled communication platform empowering people
          with motor disabilities to express themselves freely.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <GlowingButton
            variant="primary"
            size="xl"
            icon={<Zap className="w-6 h-6" />}
            onClick={() => onNavigate("communication")}
          >
            Launch IrisComm
            <ArrowRight className="w-6 h-6" />
          </GlowingButton>

          <GlowingButton
            variant="secondary"
            size="xl"
            icon={<Play className="w-6 h-6" />}
            onClick={() => {
              const demoSection = document.getElementById("demo");
              demoSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Watch Demo
          </GlowingButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
        >
          {[
            { value: "100%", label: "Hands-Free" },
            { value: "< 0.5s", label: "Response Time" },
            { value: "99.8%", label: "Accuracy" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <GlassCard key={i} className="text-center py-6">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

const AboutSection = () => {
  const conditions = [
    { name: "ALS", icon: "🧠" },
    { name: "Stroke", icon: "⚡" },
    { name: "Spinal Cord Injury", icon: "🦴" },
    { name: "Cerebral Palsy", icon: "👶" },
    { name: "TBI", icon: "💥" },
    { name: "MS", icon: "🌀" },
  ];

  return (
    <section className="py-32 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why IrisComm?
          </h2>
          <p className="text-base text-white/60 max-w-3xl mx-auto leading-relaxed">
            Millions of people worldwide cannot speak or type due to motor
            disabilities. Traditional AAC devices cost thousands of dollars.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: AlertCircle,
              title: "The Problem",
              description:
                "Existing solutions are expensive, complex, and inaccessible to most families.",
              color: "from-red-500 to-orange-500",
            },
            {
              icon: Sparkles,
              title: "Our Solution",
              description:
                "Turn any smartphone or webcam into an AI-powered communication device.",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: CheckCircle,
              title: "The Impact",
              description:
                "Give voice to those who need it most, at a fraction of the cost.",
              color: "from-green-500 to-emerald-500",
            },
          ].map((item, i) => (
            <GlassCard key={i} glow>
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-6`}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {item.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {item.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-white/50 mb-6 font-medium tracking-widest uppercase">
            Designed for people with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {conditions.map((condition, i) => (
              <motion.div
                key={condition.name}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 text-white/80 font-semibold flex items-center gap-2"
              >
                <span>{condition.icon}</span>
                <span>{condition.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Eye,
      title: "Eye Tracking",
      description: "Advanced AI gaze detection using any camera",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Brain,
      title: "AI Predictions",
      description: "Smart phrase suggestions powered by Groq AI",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Heart,
      title: "Emotion Detection",
      description: "Real-time emotion analysis and status",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Emergency Alerts",
      description: "Instant multi-channel emergency notifications",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description: "Support for multiple languages worldwide",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Wifi,
      title: "Offline Mode",
      description: "Works without internet connection",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: HomeIcon,
      title: "Smart Home",
      description: "Control IoT devices with your eyes",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Mic,
      title: "Speech Output",
      description: "Natural text-to-speech synthesis",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          <p className="text-base text-white/60 max-w-3xl mx-auto">
            Cutting-edge technology that transforms eye movements into fluent
            communication.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <GlassCard key={i} glow>
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const DemoSection = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const predictions = [
    "I need water",
    "I feel pain",
    "Please call caregiver",
    "I'm tired",
  ];

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Live Demo Interface
          </h2>
          <p className="text-base text-white/60">
            Experience the future of communication
          </p>
        </motion.div>

        <GlassCard className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Webcam Preview */}
            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-32 rounded-full border-4 border-indigo-500/50 flex items-center justify-center"
                  >
                    <Eye className="w-16 h-16 text-indigo-400" />
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                  <span className="text-sm text-white/60">AI Active</span>
                </div>
              </div>

              {/* Predictions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  AI Suggestions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {predictions.map((prediction) => (
                    <motion.button
                      type="button"
                      key={prediction}
                      data-gaze-interactive="true"
                      data-gaze-dwell="900"
                      data-gaze-stickiness="24"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMessage(prediction)}
                      className="p-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-white/10 text-white/80 hover:border-indigo-500/50 transition-all text-sm font-medium relative z-10"
                    >
                      {prediction}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Output */}
            <div className="space-y-6">
              <div className="flex-1 min-h-[300px] p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-white/60">Current Message</span>
                </div>
                <p className="text-2xl md:text-3xl text-white leading-relaxed">
                  {message || "Start typing with your eyes..."}
                </p>
              </div>

              <div className="flex gap-4">
                <GlowingButton
                  variant="primary"
                  size="md"
                  icon={<Mic className="w-5 h-5" />}
                  onClick={() => {
                    if (message) {
                      setIsSpeaking(true);
                      const utterance = new SpeechSynthesisUtterance(message);
                      utterance.onend = () => setIsSpeaking(false);
                      speechSynthesis.speak(utterance);
                    }
                  }}
                >
                  {isSpeaking ? "Speaking..." : "Speak"}
                </GlowingButton>
                <GlowingButton
                  variant="success"
                  size="md"
                  icon={<CheckCircle className="w-5 h-5" />}
                  onClick={() => {
                    if (message) {
                      alert(`Message sent: ${message}`);
                      setMessage("");
                    }
                  }}
                >
                  Send
                </GlowingButton>
              </div>

              {/* Emotion Status */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-white/60">Emotion Status</div>
                  <div className="text-lg font-semibold text-white">
                    Calm & Relaxed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

const TechStack = () => {
  const technologies = [
    { name: "MediaPipe Iris", icon: Eye, description: "Eye tracking" },
    { name: "OpenCV", icon: Cpu, description: "Computer vision" },
    { name: "FastAPI", icon: Zap, description: "Backend API" },
    { name: "MongoDB", icon: Database, description: "Database" },
    { name: "Groq AI", icon: Brain, description: "AI predictions" },
    { name: "Cloud", icon: Cloud, description: "Scalable infrastructure" },
  ];

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Powered by Advanced Technology
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {technologies.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 text-center group hover:border-indigo-500/50 transition-all"
            >
              <tech.icon className="w-12 h-12 mx-auto mb-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <div className="text-sm font-semibold text-white mb-1">
                {tech.name}
              </div>
              <div className="text-xs text-white/50">{tech.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-4 border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IrisComm</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Empowering people with motor disabilities through AI-powered eye
            tracking technology.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Demo
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
        <p>&copy; 2024 IrisComm. Built with ❤️ for accessibility.</p>
      </div>
    </div>
  </footer>
);

export default function Home() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    if (screen === "communication") {
      router.push("/advanced");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#05070A] text-white overflow-x-hidden">
      <AnimatedBackground />

      {/* Gradient Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-pink-600/30 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 w-[35rem] h-[35rem] bg-gradient-to-r from-cyan-600/30 via-blue-600/20 to-indigo-600/30 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection onNavigate={handleNavigate} />
        <AboutSection />
        <FeaturesSection />
        <DemoSection onNavigate={handleNavigate} />
        <TechStack />
        <Footer />
      </div>

      {/* Global Styles */}
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

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #05070a;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}
