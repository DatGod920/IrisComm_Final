"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  BrainCircuit,
  Eye,
  HeartPulse,
  Home,
  Mic,
  Orbit,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAppStore, type Screen } from "@/lib/store";
import { Navigation } from "@/components/navigation";
import { LandingScreen } from "@/components/screens/landing-screen";
import { CalibrationScreen } from "@/components/screens/calibration-screen";
import { CommunicationScreen } from "@/components/screens/communication-screen";
import { SpeechScreen } from "@/components/screens/speech-screen";
import { PhrasesScreen } from "@/components/screens/phrases-screen";
import { EmergencyScreen } from "@/components/screens/emergency-screen";
import { SettingsScreen } from "@/components/screens/settings-screen";
import { CaregiverDashboard } from "@/components/CaregiverDashboard";
import { MissionCenter } from "@/components/ui/MissionCenter";
import { SmartHomePanel } from "@/components/ui/SmartHomePanel";
import { AccuracyHeatmap } from "@/components/ui/AccuracyHeatmap";

const screenMeta: Record<
  Screen | "caregiver",
  { eyebrow: string; title: string; subtitle: string }
> = {
  landing: {
    eyebrow: "National Impact Demo",
    title: "Human-centered communication stack",
    subtitle:
      "An assistive platform for faster speech, safer emergency response, and caregiver visibility.",
  },
  calibration: {
    eyebrow: "Step 1",
    title: "Calibrate gaze tracking",
    subtitle:
      "Set up the camera flow before communication to improve dwell accuracy and gesture confidence.",
  },
  communication: {
    eyebrow: "Live Communication",
    title: "Type, predict, and speak",
    subtitle:
      "The keyboard, AI completions, and speech output work together with backend state sync.",
  },
  speech: {
    eyebrow: "Voice Layer",
    title: "Deliver clear spoken output",
    subtitle:
      "Control playback speed and voice mode for intelligible, user-specific communication.",
  },
  phrases: {
    eyebrow: "Phrase Bank",
    title: "Accelerate routine conversations",
    subtitle:
      "Quick-access phrases reduce fatigue and improve daily interactions for patients and caregivers.",
  },
  emergency: {
    eyebrow: "Critical Response",
    title: "Escalate in seconds",
    subtitle:
      "Emergency requests are persisted to the backend so the caregiver view reflects the alert stream.",
  },
  settings: {
    eyebrow: "Accessibility Controls",
    title: "Tune the system to the user",
    subtitle:
      "Adjust dwell time, sensitivity, language, and caregiver contact details from one place.",
  },
  smartHome: {
    eyebrow: "Connected Home",
    title: "IoT support available",
    subtitle:
      "Device control is already wired through the backend runtime store.",
  },
  ar: {
    eyebrow: "AR Ready",
    title: "Assistive overlays",
    subtitle:
      "AR features can be layered onto the same runtime state and gaze model.",
  },
  caregiver: {
    eyebrow: "Caregiver Intelligence",
    title: "Monitor state, analytics, and alerts",
    subtitle:
      "A second-screen dashboard helps families and care teams respond with context, not guesswork.",
  },
  games: {
    eyebrow: "Rehab Mode",
    title: "Gamified training",
    subtitle:
      "Rehabilitation modules can reuse the same eye-tracking and scoring state.",
  },
  rehab: {
    eyebrow: "Rehab Mode",
    title: "Therapeutic practice",
    subtitle:
      "Training and progress features share the same accessible interaction model.",
  },
};

function renderScreen(screen: Screen) {
  switch (screen) {
    case "landing":
      return <LandingScreen />;
    case "calibration":
      return <CalibrationScreen />;
    case "communication":
      return <CommunicationScreen />;
    case "speech":
      return <SpeechScreen />;
    case "phrases":
      return <PhrasesScreen />;
    case "emergency":
      return <EmergencyScreen />;
    case "settings":
      return <SettingsScreen />;
    case "caregiver":
      return <CaregiverDashboard />;
    default:
      return <LandingScreen />;
  }
}

export default function AdvancedPage() {
  const {
    currentScreen,
    setCurrentScreen,
    isCalibrated,
    predictions,
    emotion,
    isEmergencyActive,
    analyticsData,
    startDemoMode,
    caregiverMessages,
    emergencyLogs,
    iotDevices,
    currentText,
    score,
  } = useAppStore();

  const meta = screenMeta[currentScreen] || screenMeta.landing;
  const quickStats = useMemo(
    () => [
      {
        label: "Prediction Engine",
        value: `${predictions.length} live suggestions`,
        icon: Brain,
      },
      {
        label: "Latest Accuracy",
        value: `${analyticsData.accuracy.at(-1) ?? 0}%`,
        icon: Activity,
      },
      {
        label: "Emotion Signal",
        value: emotion.emotion,
        icon: HeartPulse,
      },
      {
        label: "Caregiver Sync",
        value: `${caregiverMessages.length} messages`,
        icon: Users,
      },
    ],
    [
      analyticsData.accuracy,
      caregiverMessages.length,
      emotion.emotion,
      predictions.length,
    ],
  );

  const commandSignals = useMemo(
    () => [
      {
        label: "Autonomy Index",
        value: `${Math.min(99, Math.max(42, (analyticsData.accuracy.at(-1) ?? 0) + Math.round((analyticsData.typingSpeed.at(-1) ?? 0) / 3)))}%`,
        icon: Orbit,
        tone: "from-cyan-400/20 to-indigo-500/20",
      },
      {
        label: "Ambient Control",
        value: `${iotDevices.filter((device) => device.status === "on").length} devices active`,
        icon: Home,
        tone: "from-emerald-400/20 to-teal-500/20",
      },
      {
        label: "Voice Readiness",
        value: currentText ? "Message staged" : "Awaiting input",
        icon: BrainCircuit,
        tone: "from-fuchsia-400/20 to-pink-500/20",
      },
    ],
    [
      analyticsData.accuracy,
      analyticsData.typingSpeed,
      currentText,
      iotDevices,
    ],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08111f] text-white">
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_25%),linear-gradient(180deg,_#07101d_0%,_#08111f_55%,_#050913_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-4 md:px-6">
        <header className="mb-6">
          <div className="glass-strong rounded-[2rem] border border-white/10 px-4 py-4 shadow-2xl shadow-cyan-950/30">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-emerald-400 shadow-lg shadow-cyan-900/40">
                    <Eye className="h-6 w-6 text-slate-950" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                      {meta.eyebrow}
                    </p>
                    <h1 className="text-xl font-semibold md:text-2xl">
                      {meta.title}
                    </h1>
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  {meta.subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    startDemoMode();
                    setCurrentScreen("communication");
                  }}
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-left transition hover:bg-cyan-400/15"
                >
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Launch Demo Mode
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Preload realistic communication, analytics, and emergency
                    activity for judge walkthroughs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("caregiver")}
                  className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-left transition hover:bg-emerald-400/15"
                >
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Open Caregiver Hub
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Show synchronized activity, alerts, and support messaging in
                    one view.
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-white/45">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">
                      {stat.label}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-medium text-white/90">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="glass rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-xl shadow-slate-950/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {renderScreen(currentScreen)}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="hidden xl:flex xl:flex-col xl:gap-4">
            <div className="glass rounded-[2rem] border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/75">
                Demo Narrative
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Why this project matters
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-6 text-white/65">
                <p>
                  IrisComm reduces communication delay for people with severe
                  motor impairments by combining gaze input, AI assistance, and
                  speech output.
                </p>
                <p>
                  The backend keeps caregiver messages, emergency logs, IoT
                  state, and active text synchronized so the system can be
                  demonstrated as a full product, not just a UI prototype.
                </p>
                <p>
                  For a judge demo, move from calibration to communication, then
                  trigger an emergency and open the caregiver hub to show the
                  backend trail.
                </p>
              </div>
            </div>

            <div className="glass rounded-[2rem] border border-white/10 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  System Status
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isEmergencyActive
                      ? "bg-red-500/20 text-red-300"
                      : isCalibrated
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {isEmergencyActive
                    ? "Emergency Active"
                    : isCalibrated
                      ? "Ready"
                      : "Needs Calibration"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentScreen(
                      isCalibrated ? "communication" : "calibration",
                    )
                  }
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-cyan-300" />
                    <span className="text-sm">Primary user flow</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/35" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("speech")}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <Mic className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm">Speech presentation</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/35" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("emergency")}
                  className="flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left hover:bg-red-500/15"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-4 w-4 text-red-300" />
                    <span className="text-sm">Emergency drill</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/35" />
                </button>
              </div>
            </div>

            <div className="glass rounded-[2rem] border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Live Backend Feed
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs text-white/45">Caregiver messages</p>
                  <p className="mt-1 text-lg font-medium">
                    {caregiverMessages.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs text-white/45">Emergency events</p>
                  <p className="mt-1 text-lg font-medium">
                    {emergencyLogs.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs text-white/45">Inference mode</p>
                  <p className="mt-1 text-lg font-medium">
                    Local + API fallback
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-4">
          <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                  Competitive Edge
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Adaptive Assistive Command Center
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                  This layer turns IrisComm from a communication screen into a
                  full assistive operating system: AI intent prediction,
                  smart-environment control, rehabilitation loops, and caregiver
                  intelligence in one flow.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                Score:{" "}
                <span className="font-semibold text-white">{score} XP</span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {commandSignals.map((signal) => (
                <div
                  key={signal.label}
                  className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${signal.tone} px-4 py-4`}
                >
                  <div className="flex items-center gap-2 text-white/45">
                    <signal.icon className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">
                      {signal.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-semibold text-white/95">
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-xl shadow-slate-950/20">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Rehab + Motivation
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Mission-driven engagement
                </h2>
              </div>
              <MissionCenter />
            </div>

            <div className="grid gap-4">
              <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-xl shadow-slate-950/20">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                      Spatial Focus
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Gaze performance heatmap
                    </h2>
                  </div>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                    1000-sample memory
                  </div>
                </div>
                <AccuracyHeatmap />
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-5 shadow-xl shadow-slate-950/20">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                      Ambient Automation
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Smart environment control
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("communication")}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 hover:bg-white/[0.08]"
                  >
                    Return to typing
                  </button>
                </div>
                <SmartHomePanel />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Navigation />
    </main>
  );
}
