"use client";

import { motion } from "framer-motion";
import {
  Volume2,
  Trash2,
  Delete,
  Space,
  Sparkles,
  Wifi,
  Eye,
  BrainCircuit,
  HeartPulse,
  TimerReset,
  Lightbulb,
  Fan,
  MessageSquareHeart,
  Siren,
  Bookmark,
  History,
  Star,
  Send,
  Mic,
  MicOff,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { SpeechWave } from "@/components/ui/speech-wave";
import { GenerativeAIPredictions } from "@/components/advanced/generative-ai-predictions";
import { useAppStore } from "@/lib/store";
import { useState, useCallback, useRef, useEffect } from "react";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function CommunicationScreen() {
  const {
    currentText,
    appendToText,
    clearText,
    backspace,
    predictions,
    setCurrentText,
    isSpeaking,
    setIsSpeaking,
    dwellTime,
    emotion,
    toggleIotDevice,
    triggerEmergency,
    addCaregiverMessage,
    setCurrentScreen,
    updateMissionProgress,
    addScore,
    savedMessages,
    saveMessage,
    recentMessages,
    addRecentMessage,
    audioFeedback,
  } = useAppStore();

  const [isConnected] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const handleSpeak = useCallback(() => {
    if (!currentText || isSpeaking) return;

    addRecentMessage(currentText);
    if (audioFeedback) {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkYqKg3V0bWhUT0CAgH2Ai42dmJWNh4GAd3RxbGlVUUaAf3+BhYqQkJGPioWCf3t4d3Vvbm9xcXBubW1sa2ppaGdlZGNiYVBOTkxLSklIR0ZFRENCQUA/Pj08Ozo5OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw8ODg4NDQ0NDQ4ODg8ODg8ODg8=",
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [currentText, isSpeaking, setIsSpeaking, addRecentMessage, audioFeedback]);

  const startVoiceInput = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        setCurrentText(
          currentText + (currentText ? " " : "") + finalTranscript,
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [currentText, setCurrentText]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const handlePredictionSelect = useCallback(
    (text: string) => {
      setCurrentText(text);
    },
    [setCurrentText],
  );

  const carePrompt =
    emotion.emotion === "stressed" || emotion.emotion === "pain"
      ? {
          title: "Care signal detected",
          description:
            "The system detected stress or pain indicators. You can alert support, ask for help, or trigger emergency escalation.",
        }
      : currentText.toLowerCase().includes("help") ||
          currentText.toLowerCase().includes("pain")
        ? {
            title: "High-priority intent recognized",
            description:
              "Your message suggests you may need assistance. IrisComm can notify a caregiver or stage an emergency message.",
          }
        : null;

  const quickActions = [
    {
      label: "Smart Lights",
      icon: Lightbulb,
      tone: "secondary" as const,
      action: () => {
        toggleIotDevice("light-1");
        updateMissionProgress("m1", 1);
        addScore(20);
      },
    },
    {
      label: "Ceiling Fan",
      icon: Fan,
      tone: "secondary" as const,
      action: () => {
        toggleIotDevice("fan-1");
        addScore(20);
      },
    },
    {
      label: "Caregiver Ping",
      icon: MessageSquareHeart,
      tone: "default" as const,
      action: () => {
        addCaregiverMessage(
          currentText ||
            "Please check on me. IrisComm assist mode triggered a support ping.",
          "Patient",
        );
        setCurrentScreen("caregiver");
        addScore(30);
      },
    },
    {
      label: "Emergency Alert",
      icon: Siren,
      tone: "emergency" as const,
      action: () => {
        triggerEmergency({
          type: "Adaptive Emergency Assist",
          status: "Alert Sent",
          message:
            currentText ||
            "Adaptive care prompt triggered because the user may need urgent help.",
        });
        addScore(40);
      },
    },
  ];

  return (
    <div className="flex flex-col px-3 py-4 pb-24">
      {/* Header Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-full">
            <Eye className="w-4 h-4 text-primary animate-iris-scan" />
            <span className="text-sm font-medium">Eye Tracking Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 glass px-3 py-2 rounded-full">
          <Wifi
            className={`w-4 h-4 ${isConnected ? "text-accent" : "text-destructive"}`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </motion.div>

      {/* Main Text Display */}
      <GlassCard
        variant="strong"
        className="mb-4 min-h-[90px] flex items-center justify-center"
      >
        <TypingIndicator
          text={currentText || "Start typing..."}
          className={
            currentText ? "text-foreground" : "text-muted-foreground/50"
          }
          showCursor={!!currentText}
        />
      </GlassCard>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Neural Copilot
              </p>
              <p className="text-sm font-medium text-white/90">
                {currentText ? "Context locked" : "Waiting for intent"}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Emotion-aware voice
              </p>
              <p className="text-sm font-medium capitalize text-white/90">
                {emotion.emotion}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <TimerReset className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Adaptive dwell
              </p>
              <p className="text-sm font-medium text-white/90">
                {(dwellTime / 1000).toFixed(1)}s precision mode
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-muted-foreground">
            AI Suggestions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {predictions.map((prediction, index) => (
            <GazeButton
              key={index}
              variant="secondary"
              size="md"
              onClick={() => handlePredictionSelect(prediction)}
              onGazeSelect={() => handlePredictionSelect(prediction)}
              dwellTime={dwellTime}
              gazeStickiness={26}
              className="text-sm"
            >
              {prediction}
            </GazeButton>
          ))}
        </div>
      </motion.div>

      <GlassCard variant="strong" className="mb-4">
        <GenerativeAIPredictions
          currentText={currentText}
          emotion={emotion.emotion}
          onSelect={handlePredictionSelect}
        />
      </GlassCard>

      {carePrompt && (
        <GlassCard variant="strong" className="mb-4 border-red-400/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-red-300/80">
                Adaptive Care Guard
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {carePrompt.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                {carePrompt.description}
              </p>
            </div>
            <GazeButton
              variant="emergency"
              size="md"
              onClick={() =>
                triggerEmergency({
                  type: "Emotion-Aware Escalation",
                  status: "Alert Sent",
                  message:
                    currentText ||
                    "Emotion-aware escalation triggered from the communication screen.",
                })
              }
              onGazeSelect={() =>
                triggerEmergency({
                  type: "Emotion-Aware Escalation",
                  status: "Alert Sent",
                  message:
                    currentText ||
                    "Emotion-aware escalation triggered from the communication screen.",
                })
              }
              dwellTime={dwellTime}
            >
              <Siren className="h-5 w-5" />
              Escalate Now
            </GazeButton>
          </div>
        </GlassCard>
      )}

      <GlassCard variant="default" className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Independence Layer
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Action rail
            </h3>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
            Voice + Gaze + AI
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {quickActions.map((item) => (
            <GazeButton
              key={item.label}
              variant={item.tone}
              size="md"
              onClick={item.action}
              onGazeSelect={item.action}
              dwellTime={dwellTime}
              className="w-full"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </GazeButton>
          ))}
        </div>
      </GlassCard>

      {/* Voice Input Indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Mic className="w-6 h-6 text-red-400" />
          </motion.div>
          <span className="text-red-300">Listening... Speak now</span>
          <GazeButton
            variant="default"
            size="sm"
            onClick={stopVoiceInput}
            onGazeSelect={stopVoiceInput}
            dwellTime={500}
          >
            Stop
          </GazeButton>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        {/* Voice Input Button */}
        <GazeButton
          variant={isListening ? "emergency" : "secondary"}
          size="lg"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          onGazeSelect={isListening ? stopVoiceInput : startVoiceInput}
          dwellTime={dwellTime}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <MicOff className="w-6 h-6" />
            </motion.div>
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </GazeButton>

        {/* Speak Button */}
        <GazeButton
          variant="primary"
          size="lg"
          onClick={handleSpeak}
          onGazeSelect={handleSpeak}
          dwellTime={dwellTime}
          className="flex-1"
          disabled={!currentText || isSpeaking}
        >
          {isSpeaking ? (
            <SpeechWave isActive={true} barCount={5} />
          ) : (
            <>
              <Volume2 className="w-6 h-6" />
              Speak
            </>
          )}
        </GazeButton>

        <GazeButton
          variant="default"
          size="lg"
          onClick={() => {
            if (currentText) {
              saveMessage(currentText);
              if (audioFeedback) {
                const audio = new Audio(
                  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkYqKg3V0bWhUT0CAgH2Ai42dmJWNh4GAd3RxbGlVUUaAf3+BhYqQkJGPioWCf3t4d3Vvbm9xcXBubW1sa2ppaGdlZGNiYVBOTkxLSklIR0ZFRENCQUA/Pj08Ozo5OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw8ODg4NDQ0NDQ4ODg8ODg8ODg8=",
                );
                audio.volume = 0.3;
                audio.play().catch(() => {});
              }
            }
          }}
          onGazeSelect={() => currentText && saveMessage(currentText)}
          dwellTime={dwellTime}
          disabled={!currentText}
        >
          <Bookmark className="w-6 h-6" />
        </GazeButton>

        <GazeButton
          variant="default"
          size="lg"
          onClick={clearText}
          onGazeSelect={clearText}
          dwellTime={dwellTime}
        >
          <Trash2 className="w-6 h-6" />
        </GazeButton>
      </div>

      {/* Saved & Recent Messages Toggle */}
      <div className="flex gap-2 mb-4">
        <GazeButton
          variant={showSaved ? "primary" : "default"}
          size="md"
          onClick={() => {
            setShowSaved(!showSaved);
            setShowRecent(false);
          }}
          onGazeSelect={() => {
            setShowSaved(!showSaved);
            setShowRecent(false);
          }}
          dwellTime={dwellTime}
          className="flex-1"
        >
          <Star className="w-4 h-4" />
          Saved ({savedMessages.length})
        </GazeButton>
        <GazeButton
          variant={showRecent ? "primary" : "default"}
          size="md"
          onClick={() => {
            setShowRecent(!showRecent);
            setShowSaved(false);
          }}
          onGazeSelect={() => {
            setShowRecent(!showRecent);
            setShowSaved(false);
          }}
          dwellTime={dwellTime}
          className="flex-1"
        >
          <History className="w-4 h-4" />
          Recent ({recentMessages.length})
        </GazeButton>
      </div>

      {/* Saved Messages */}
      {showSaved && savedMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex flex-wrap gap-2">
            {savedMessages.map((msg, i) => (
              <GazeButton
                key={i}
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCurrentText(msg);
                  setShowSaved(false);
                }}
                onGazeSelect={() => {
                  setCurrentText(msg);
                  setShowSaved(false);
                }}
                dwellTime={dwellTime}
                className="text-xs"
              >
                {msg.length > 25 ? msg.slice(0, 25) + "..." : msg}
              </GazeButton>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Messages */}
      {showRecent && recentMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex flex-wrap gap-2">
            {recentMessages.map((msg, i) => (
              <GazeButton
                key={i}
                variant="default"
                size="sm"
                onClick={() => {
                  setCurrentText(msg);
                  setShowRecent(false);
                }}
                onGazeSelect={() => {
                  setCurrentText(msg);
                  setShowRecent(false);
                }}
                dwellTime={dwellTime}
                className="text-xs"
              >
                {msg.length > 25 ? msg.slice(0, 25) + "..." : msg}
              </GazeButton>
            ))}
          </div>
        </motion.div>
      )}

      {/* Virtual Keyboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
            {row.map((key) => (
              <GazeButton
                key={key}
                variant="default"
                size="md"
                onClick={() => appendToText(key)}
                onGazeSelect={() => appendToText(key)}
                dwellTime={dwellTime}
                className="w-8 h-10 md:w-10 md:h-12 text-base font-semibold"
              >
                {key}
              </GazeButton>
            ))}
          </div>
        ))}

        {/* Bottom row with space and backspace */}
        <div className="flex justify-center gap-2">
          <GazeButton
            variant="default"
            size="md"
            onClick={backspace}
            onGazeSelect={backspace}
            dwellTime={dwellTime}
            className="w-16 h-10 md:w-20 md:h-12"
          >
            <Delete className="w-5 h-5" />
          </GazeButton>

          <GazeButton
            variant="default"
            size="md"
            onClick={() => appendToText(" ")}
            onGazeSelect={() => appendToText(" ")}
            dwellTime={dwellTime}
            className="flex-1 max-w-xs h-10 md:h-12"
          >
            <Space className="w-5 h-5" />
            Space
          </GazeButton>

          <GazeButton
            variant="primary"
            size="md"
            onClick={handleSpeak}
            onGazeSelect={handleSpeak}
            dwellTime={dwellTime}
            className="w-16 h-10 md:w-20 md:h-12"
            disabled={!currentText || isSpeaking}
          >
            <Volume2 className="w-5 h-5" />
          </GazeButton>
        </div>
      </motion.div>
    </div>
  );
}
