"use client";

import { motion } from "framer-motion";
import {
  Eye,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  Settings,
  Volume2,
  Home,
  Users,
} from "lucide-react";
import { useAppStore, Screen } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems: { icon: typeof Eye; label: string; screen: Screen }[] = [
  { icon: Home, label: "Home", screen: "landing" },
  { icon: Eye, label: "Calibrate", screen: "calibration" },
  { icon: MessageSquare, label: "Communicate", screen: "communication" },
  { icon: Volume2, label: "Speech", screen: "speech" },
  { icon: BookOpen, label: "Phrases", screen: "phrases" },
  { icon: AlertTriangle, label: "Emergency", screen: "emergency" },
  { icon: Users, label: "Caregiver", screen: "caregiver" },
  { icon: Settings, label: "Settings", screen: "settings" },
];

export function Navigation() {
  const { currentScreen, setCurrentScreen, isCalibrated } = useAppStore();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
    >
      <div className="max-w-4xl mx-auto glass-strong rounded-2xl p-2 md:p-3">
        <div className="flex items-center justify-around gap-1">
          {navItems.map(({ icon: Icon, label, screen }) => {
            const isActive = currentScreen === screen;
            const isDisabled =
              !isCalibrated &&
              screen !== "landing" &&
              screen !== "calibration" &&
              screen !== "settings" &&
              screen !== "caregiver";

            return (
              <motion.button
                key={screen}
                data-gaze-interactive="true"
                data-gaze-dwell="800"
                data-gaze-stickiness="30"
                onClick={() => !isDisabled && setCurrentScreen(screen)}
                whileHover={!isDisabled ? { scale: 1.1 } : undefined}
                whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 md:p-2 rounded-lg transition-all min-w-[50px] md:min-w-[65px]",
                  isActive && "bg-primary/20 text-primary",
                  !isActive &&
                    !isDisabled &&
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isDisabled && "opacity-30 cursor-not-allowed",
                  screen === "emergency" &&
                    "text-destructive hover:text-destructive",
                )}
                disabled={isDisabled}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 md:w-6 md:h-6",
                    isActive && "drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]",
                  )}
                />
                <span className="text-xs font-medium hidden md:block">
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
