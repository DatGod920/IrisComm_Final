"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Eye,
  Timer,
  Languages,
  User,
  BrainCircuit,
  RotateCcw,
  WifiOff,
  Moon,
  Sun,
  Volume2,
  Zap,
  Heart,
  Shield,
  AlertCircle,
  EyeOff,
  Accessibility,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

export function SettingsScreen() {
  const {
    eyeSensitivity,
    setEyeSensitivity,
    dwellTime,
    setDwellTime,
    language,
    setLanguage,
    caregiverContact,
    setCaregiverContact,
    patientName,
    setPatientName,
    diagnosis,
    setDiagnosis,
    priorityNeeds,
    setPriorityNeeds,
    careNotes,
    setCareNotes,
    setIsCalibrated,
    setCalibrationProgress,
    setCurrentScreen,
    startDemoMode,
    audioFeedback,
    setAudioFeedback,
    dwellPresets,
    setDwellPresets,
    visualFeedback,
    setVisualFeedback,
    bloodType,
    setBloodType,
    medicalConditions,
    setMedicalConditions,
    medications,
    setMedications,
    emergencyMedicalInfo,
    setEmergencyMedicalInfo,
    inactivityTimeout,
    setInactivityTimeout,
    autoAlertEnabled,
    setAutoAlertEnabled,
  } = useAppStore();

  const { theme, setTheme } = useTheme();
  const [offlineMode, setOfflineMode] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newMed, setNewMed] = useState("");

  const handleResetCalibration = () => {
    setIsCalibrated(false);
    setCalibrationProgress(0);
    setCurrentScreen("calibration");
  };

  return (
    <div className="px-3 py-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Eye Tracking Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="default">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Eye Tracking</h2>
            </div>

            {/* Eye Sensitivity */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label>Eye Sensitivity</Label>
                <span className="text-sm text-muted-foreground">
                  {eyeSensitivity}%
                </span>
              </div>
              <Slider
                value={[eyeSensitivity]}
                onValueChange={([value]) => setEyeSensitivity(value)}
                min={10}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Less Sensitive</span>
                <span>More Sensitive</span>
              </div>
            </div>

            {/* Dwell Time */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Dwell Time
                </Label>
                <span className="text-sm text-muted-foreground">
                  {dwellTime / 1000}s
                </span>
              </div>
              <Slider
                value={[dwellTime]}
                onValueChange={([value]) => setDwellTime(value)}
                min={500}
                max={3000}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Faster (0.5s)</span>
                <span>Slower (3s)</span>
              </div>
            </div>

            {/* Dwell Presets */}
            <div className="mb-6">
              <Label className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                Quick Presets
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["fast", "normal", "precise"] as const).map((preset) => (
                  <GazeButton
                    key={preset}
                    variant={dwellPresets === preset ? "primary" : "default"}
                    size="sm"
                    onClick={() => setDwellPresets(preset)}
                    onGazeSelect={() => setDwellPresets(preset)}
                    dwellTime={dwellTime}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </GazeButton>
                ))}
              </div>
            </div>

            {/* Visual Feedback */}
            <div className="mb-6">
              <Label className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" />
                Visual Feedback
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["highlight", "cursor", "both"] as const).map((fb) => (
                  <GazeButton
                    key={fb}
                    variant={visualFeedback === fb ? "primary" : "default"}
                    size="sm"
                    onClick={() => setVisualFeedback(fb)}
                    onGazeSelect={() => setVisualFeedback(fb)}
                    dwellTime={dwellTime}
                  >
                    {fb.charAt(0).toUpperCase() + fb.slice(1)}
                  </GazeButton>
                ))}
              </div>
            </div>

            {/* Audio Feedback Toggle */}
            <div className="flex items-center justify-between mb-6">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio Feedback
              </Label>
              <Switch
                checked={audioFeedback}
                onCheckedChange={setAudioFeedback}
              />
            </div>

            {/* Inactivity Auto-Alert */}
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Auto Alert (Inactivity)
                </Label>
                <Switch
                  checked={autoAlertEnabled}
                  onCheckedChange={setAutoAlertEnabled}
                />
              </div>
              {autoAlertEnabled && (
                <div>
                  <Slider
                    value={[inactivityTimeout]}
                    onValueChange={([value]) => setInactivityTimeout(value)}
                    min={1}
                    max={30}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 min</span>
                    <span>
                      Alert after {inactivityTimeout} min of inactivity
                    </span>
                    <span>30 min</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Calibration */}
            <GazeButton
              variant="default"
              size="md"
              onClick={handleResetCalibration}
              onGazeSelect={handleResetCalibration}
              dwellTime={dwellTime}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Calibration
            </GazeButton>
          </GlassCard>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="default">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Language</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <GazeButton
                  key={lang.code}
                  variant={language === lang.code ? "primary" : "default"}
                  size="md"
                  onClick={() => setLanguage(lang.code)}
                  onGazeSelect={() => setLanguage(lang.code)}
                  dwellTime={dwellTime}
                >
                  {lang.name}
                </GazeButton>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard variant="default">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Presentation Tools
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Collapsed by default for live demos
                    </p>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Open
                </span>
              </summary>

              <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
                <p className="text-sm text-muted-foreground">
                  Local fallback mode for presentations if the third-party
                  eye-tracking session is unavailable. This does not reset the
                  vendor trial.
                </p>
                <GazeButton
                  variant="secondary"
                  size="md"
                  onClick={startDemoMode}
                  onGazeSelect={startDemoMode}
                  dwellTime={dwellTime}
                  className="w-full"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Start Presentation Mode
                </GazeButton>
              </div>
            </details>
          </GlassCard>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="default">
            <div className="flex items-center gap-3 mb-6">
              <Moon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  Dark Mode
                </Label>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Sound Feedback
                </Label>
                <Switch
                  checked={audioFeedback}
                  onCheckedChange={setAudioFeedback}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  Offline Mode
                </Label>
                <Switch
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Caregiver Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="default">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Emergency Contact</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="caregiver">Caregiver Phone Number</Label>
                <Input
                  id="caregiver"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={caregiverContact}
                  onChange={(e) => setCaregiverContact(e.target.value)}
                  className="mt-2 bg-background/50 text-lg h-14"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                This contact will be notified during emergency alerts.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard variant="default">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Personalization</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-2 bg-background/50 h-12"
                />
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis / Condition</Label>
                <Input
                  id="diagnosis"
                  placeholder="ALS, stroke recovery, spinal injury..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-2 bg-background/50 h-12"
                />
              </div>

              <div>
                <Label htmlFor="priority-needs">Priority Needs</Label>
                <Input
                  id="priority-needs"
                  placeholder="Pain management, hydration, breathing support"
                  value={priorityNeeds.join(", ")}
                  onChange={(e) =>
                    setPriorityNeeds(
                      e.target.value
                        .split(",")
                        .map((need) => need.trim())
                        .filter(Boolean),
                    )
                  }
                  className="mt-2 bg-background/50 h-12"
                />
              </div>

              {/* Medical Info for Emergencies */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="flex items-center gap-2 text-md font-semibold mb-4">
                  <Heart className="w-4 h-4 text-red-400" />
                  Emergency Medical Info
                </h3>
              </div>

              <div>
                <Label htmlFor="blood-type">Blood Type</Label>
                <Input
                  id="blood-type"
                  placeholder="e.g., A+, O-, B+"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="mt-2 bg-background/50 h-12"
                />
              </div>

              <div>
                <Label>Medical Conditions</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCondition.trim()) {
                        setMedicalConditions([
                          ...medicalConditions,
                          newCondition.trim(),
                        ]);
                        setNewCondition("");
                      }
                    }}
                    className="bg-background/50 h-10"
                  />
                  <GazeButton
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (newCondition.trim()) {
                        setMedicalConditions([
                          ...medicalConditions,
                          newCondition.trim(),
                        ]);
                        setNewCondition("");
                      }
                    }}
                    dwellTime={dwellTime}
                  >
                    Add
                  </GazeButton>
                </div>
                {medicalConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {medicalConditions.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-red-500/20 text-xs flex items-center gap-1"
                      >
                        {c}
                        <button
                          onClick={() =>
                            setMedicalConditions(
                              medicalConditions.filter((_, j) => j !== i),
                            )
                          }
                          className="ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Current Medications</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add medication"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMed.trim()) {
                        setMedications([...medications, newMed.trim()]);
                        setNewMed("");
                      }
                    }}
                    className="bg-background/50 h-10"
                  />
                  <GazeButton
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (newMed.trim()) {
                        setMedications([...medications, newMed.trim()]);
                        setNewMed("");
                      }
                    }}
                    dwellTime={dwellTime}
                  >
                    Add
                  </GazeButton>
                </div>
                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {medications.map((m, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-blue-500/20 text-xs flex items-center gap-1"
                      >
                        {m}
                        <button
                          onClick={() =>
                            setMedications(
                              medications.filter((_, j) => j !== i),
                            )
                          }
                          className="ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="emergency-notes">Emergency Medical Notes</Label>
                <Input
                  id="emergency-notes"
                  placeholder="Allergies, allergies to medications, important medical info..."
                  value={emergencyMedicalInfo}
                  onChange={(e) => setEmergencyMedicalInfo(e.target.value)}
                  className="mt-2 bg-background/50 h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This info is sent with emergency alerts
                </p>
              </div>

              <div>
                <Label htmlFor="care-notes">Care Notes For AI</Label>
                <Input
                  id="care-notes"
                  placeholder="Add care context the AI should respect"
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  className="mt-2 bg-background/50 h-12"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                This profile is stored in the backend and used to make AI
                suggestions more relevant, safer, and more personalized.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <GlassCard variant="subtle" className="text-center">
            <h3 className="font-semibold mb-2">IrisComm</h3>
            <p className="text-sm text-muted-foreground mb-2">
              AI Eye Controlled Communication Platform
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
