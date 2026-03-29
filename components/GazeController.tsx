"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useEyeTracking } from "@/hooks/useEyeTracking";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useAppStore } from "@/lib/store";
import { GazeCursorOverlay } from "./gaze/GazeCursorOverlay";
import { toast } from "sonner";
import { aiService } from "@/lib/ai-service";
import { voiceService } from "@/lib/voice-service";

const INTERACTIVE_SELECTOR = [
  '[data-gaze-interactive="true"]',
  "button",
  "a[href]",
  '[role="button"]',
  "input:not([type='hidden'])",
  "textarea",
  "select",
  "summary",
].join(", ");

const TARGET_SAMPLE_OFFSETS = [
  [0, 0],
  [0, -8],
  [0, 8],
  [-8, 0],
  [8, 0],
  [-12, -12],
  [12, -12],
  [-12, 12],
  [12, 12],
] as const;

const ACTIVE_DWELL_STICKINESS_BOOST = 44;
const TARGET_LOST_GRACE_MS = 260;

function resolveInteractiveElement(element: Element | null) {
  if (!(element instanceof Element)) {
    return null;
  }

  const interactiveElement = element.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  return interactiveElement instanceof HTMLElement ? interactiveElement : null;
}

function resolveInteractiveTargetAtPoint(clientX: number, clientY: number) {
  if (typeof document === "undefined") {
    return null;
  }

  for (const [offsetX, offsetY] of TARGET_SAMPLE_OFFSETS) {
    const target = resolveInteractiveElement(
      document.elementFromPoint(clientX + offsetX, clientY + offsetY),
    );
    if (target) {
      return target;
    }
  }

  return null;
}

function dispatchHoverEvent(
  target: HTMLElement,
  type: "mouseenter" | "mouseleave" | "mouseover" | "mouseout",
  clientX: number,
  clientY: number,
) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: type === "mouseover" || type === "mouseout",
      cancelable: true,
      clientX,
      clientY,
      view: window,
    }),
  );
}

function dispatchPointerHoverEvent(
  target: HTMLElement,
  type: "pointerenter" | "pointerleave" | "pointerover" | "pointerout",
  clientX: number,
  clientY: number,
) {
  if (typeof PointerEvent === "undefined") {
    return;
  }

  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: type === "pointerover" || type === "pointerout",
      cancelable: true,
      clientX,
      clientY,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      view: window,
    }),
  );
}

function isTargetDisabled(target: HTMLElement) {
  return (
    target.matches(":disabled") ||
    target.getAttribute("aria-disabled") === "true"
  );
}

/** GazeButton and similar components run their own dwell + onGazeSelect; skip global dwell to avoid double clicks. */
function isSelfManagedGazeTarget(target: HTMLElement | null) {
  return target?.dataset?.gazeSkipGlobalDwell === "true";
}

function getTargetDwellTime(target: HTMLElement, fallback: number) {
  const parsed = Number(target.dataset.gazeDwell);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getTargetStickiness(target: HTMLElement) {
  const parsed = Number(target.dataset.gazeStickiness);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 18;
}

function isPointNearTarget(
  target: HTMLElement,
  clientX: number,
  clientY: number,
  extraPadding = 0,
) {
  const rect = target.getBoundingClientRect();
  const padding = getTargetStickiness(target) + extraPadding;

  return (
    clientX >= rect.left - padding &&
    clientX <= rect.right + padding &&
    clientY >= rect.top - padding &&
    clientY <= rect.bottom + padding
  );
}

function triggerGazeClick(target: HTMLElement, clientX: number, clientY: number) {
  target.focus({ preventScroll: true });
  target.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      view: window,
    }),
  );
  target.dispatchEvent(
    new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      view: window,
    }),
  );
  target.click();
}

export function GazeController() {
  const { 
    isCalibrated, 
    setIsCalibrated,
    setCalibrationProgress,
    currentScreen, 
    backspace, 
    appendToText, 
    speakCurrentSentence,
    dwellTime,
    updateDynamicPhrases,
    isVoiceActive,
    setIsVoiceActive,
    triggerEmergency,
    isEmergencyActive,
    toggleIotDevice,
    clearText,
    undo,
    setEmotion,
    isSpeaking,
    addGazeSample,
    setGazePosition
  } = useAppStore();

  const emergencyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactiveAnimationRef = useRef<number | null>(null);
  const lastHoveredElementRef = useRef<HTMLElement | null>(null);
  const targetLostAtRef = useRef<number | null>(null);
  const dwellStartRef = useRef<number | null>(null);
  const dwellActivatedRef = useRef(false);
  const dwellSessionRef = useRef(0);
  const lastGazeCoordinatesRef = useRef({ x: 0, y: 0 });
  const [isEmergencyHovered, setIsEmergencyHovered] = useState(false);
  const [gazeDwellProgress, setGazeDwellProgress] = useState(0);

  const clearInteractiveDwell = useCallback(() => {
    dwellSessionRef.current += 1;

    if (interactiveTimerRef.current) {
      clearTimeout(interactiveTimerRef.current);
      interactiveTimerRef.current = null;
    }

    if (interactiveAnimationRef.current !== null) {
      cancelAnimationFrame(interactiveAnimationRef.current);
      interactiveAnimationRef.current = null;
    }

    dwellStartRef.current = null;
    dwellActivatedRef.current = false;
    setGazeDwellProgress(0);
  }, []);

  const clearHoveredTarget = useCallback((clientX = 0, clientY = 0) => {
    clearInteractiveDwell();
    targetLostAtRef.current = null;

    if (lastHoveredElementRef.current && typeof window !== "undefined") {
      dispatchPointerHoverEvent(lastHoveredElementRef.current, "pointerleave", clientX, clientY);
      dispatchPointerHoverEvent(lastHoveredElementRef.current, "pointerout", clientX, clientY);
      dispatchHoverEvent(lastHoveredElementRef.current, "mouseleave", clientX, clientY);
      dispatchHoverEvent(lastHoveredElementRef.current, "mouseout", clientX, clientY);
    }

    lastHoveredElementRef.current = null;
  }, [clearInteractiveDwell]);

  const startInteractiveDwell = useCallback(
    (target: HTMLElement) => {
      clearInteractiveDwell();

      if (isTargetDisabled(target)) {
        return;
      }

      const targetDwellTime = getTargetDwellTime(target, dwellTime);
      const dwellSession = dwellSessionRef.current + 1;
      dwellSessionRef.current = dwellSession;
      dwellStartRef.current = Date.now();
      dwellActivatedRef.current = false;
      setGazeDwellProgress(0);

      const updateProgress = () => {
        if (
          dwellSessionRef.current !== dwellSession ||
          !dwellStartRef.current ||
          dwellActivatedRef.current
        ) {
          interactiveAnimationRef.current = null;
          return;
        }

        const activeTarget = lastHoveredElementRef.current;
        if (
          !activeTarget ||
          !activeTarget.isConnected ||
          isTargetDisabled(activeTarget)
        ) {
          interactiveAnimationRef.current = null;
          return;
        }

        const progress = Math.min(
          (Date.now() - dwellStartRef.current) / targetDwellTime,
          1,
        );
        setGazeDwellProgress(progress);

        if (progress < 1) {
          interactiveAnimationRef.current = requestAnimationFrame(updateProgress);
        } else {
          interactiveAnimationRef.current = null;
        }
      };

      interactiveAnimationRef.current = requestAnimationFrame(updateProgress);
      interactiveTimerRef.current = setTimeout(() => {
        if (
          dwellSessionRef.current !== dwellSession ||
          dwellActivatedRef.current
        ) {
          return;
        }

        const activeTarget = lastHoveredElementRef.current;
        if (
          !activeTarget ||
          !activeTarget.isConnected ||
          isTargetDisabled(activeTarget)
        ) {
          return;
        }

        dwellActivatedRef.current = true;
        setGazeDwellProgress(1);
        const { x, y } = lastGazeCoordinatesRef.current;
        const liveTarget = resolveInteractiveTargetAtPoint(x, y);

        triggerGazeClick(
          liveTarget ?? activeTarget,
          x,
          y,
        );
      }, targetDwellTime);
    },
    [clearInteractiveDwell, dwellTime],
  );

  const handleEmotionChange = useCallback((emotion: string) => {
    // Map MediaPipe emotion to AppState emotion
    const mapped: any = {
      "happy": "happy",
      "sad": "sad",
      "surprised": "stressed", // Mapping for speech effect
      "angry": "stressed",
      "neutral": "neutral"
    };
    setEmotion({ emotion: mapped[emotion] || "neutral" });
  }, [setEmotion]);

  const handleHandGesture = useCallback((gesture: string) => {
    if (gesture === "swipe-left") {
      undo();
      toast.info("Hand Gesture: Undo");
    }
  }, [undo]);

  const { videoRef: handVideoRef, startHandTracking } = useHandTracking(handleHandGesture);

  useEffect(() => {
    if (currentScreen !== "landing") {
      startHandTracking();
    }
  }, [currentScreen, startHandTracking]);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log("Voice Command:", command);
    if (command.includes("backspace") || command.includes("delete")) {
      backspace();
      toast.info("Voice: Backspace");
    } else if (command.includes("space")) {
      appendToText(" ");
      toast.info("Voice: Space");
    } else if (command.includes("clear")) {
      clearText();
      toast.info("Voice: Clear");
    } else if (command.includes("speak") || command.includes("talk")) {
      speakCurrentSentence();
      toast.info("Voice: Speaking");
    } else if (command.includes("light")) {
      toggleIotDevice("light-1");
      toast.info("Voice: Smart Light Toggled");
    } else if (command.includes("fan")) {
      toggleIotDevice("fan-1");
      toast.info("Voice: Smart Fan Toggled");
    } else if (command.includes("emergency") || command.includes("help")) {
      triggerEmergency();
      toast.error("Voice: EMERGENCY TRIGGERED");
    }
  }, [backspace, appendToText, clearText, speakCurrentSentence, toggleIotDevice, triggerEmergency]);

  useEffect(() => {
    if (isVoiceActive) {
      voiceService.startListening(handleVoiceCommand);
    } else {
      voiceService.stopListening();
    }
    return () => voiceService.stopListening();
  }, [isVoiceActive, handleVoiceCommand]);

  useEffect(() => {
    // Initialize AI Service
    aiService
      .initialize()
      .catch((error) => {
        console.warn("AI service started in fallback mode:", error);
        return false;
      })
      .finally(() => {
        updateDynamicPhrases();
      });

    // Update dynamic phrases every 5 minutes
    const interval = setInterval(updateDynamicPhrases, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateDynamicPhrases]);

  const handleWink = useCallback((eye: "left" | "right") => {
    if (eye === "left") {
      backspace();
      toast.info("Backspace (Left Wink)");
    } else {
      appendToText(" ");
      toast.info("Space (Right Wink)");
    }
  }, [backspace, appendToText]);

  const handleBlink = useCallback((type: "single" | "double" | "left" | "right") => {
    if (type === "double") {
      // Logic for selection - in a real app this would trigger the current hovered element
      toast.success("Select (Double Blink)");
    }
  }, []);

  const handleEyebrowRaise = useCallback((eye: "left" | "right") => {
    speakCurrentSentence();
    toast.success("Speaking current sentence (Eyebrow Raise)");
  }, [speakCurrentSentence]);

  const {
    videoRef,
    eyeState,
    cameraReady,
    startCamera,
    getGazePosition,
  } = useEyeTracking({
    onWink: handleWink,
    onBlink: handleBlink,
    onEyebrowRaise: handleEyebrowRaise,
    onEmotionChange: handleEmotionChange,
    dwellTime: dwellTime,
  });

  const pathname = usePathname();
  /** Marketing `/` and advanced app routes need the camera; store `currentScreen === "landing"` stays true on `/` so we cannot rely on currentScreen alone. */
  const shouldRunEyeCamera =
    pathname === "/" ||
    pathname?.startsWith("/advanced") ||
    pathname?.startsWith("/ultra-advanced");

  useEffect(() => {
    if (!shouldRunEyeCamera) {
      return;
    }
    startCamera();
  }, [shouldRunEyeCamera, startCamera]);

  useEffect(() => {
    if (!eyeState.isCalibrated) {
      return;
    }

    setCalibrationProgress(100);

    if (!isCalibrated) {
      setIsCalibrated(true);
    }
  }, [
    eyeState.isCalibrated,
    isCalibrated,
    setCalibrationProgress,
    setIsCalibrated,
  ]);

  const gazePos = getGazePosition();

  // Dispatch hover and dwell-click events on the actual interactive element.
  useEffect(() => {
    if (!eyeState.isTracking || typeof window === "undefined") {
      clearHoveredTarget();
      return;
    }

    const x = gazePos.x * window.innerWidth;
    const y = gazePos.y * window.innerHeight;
    lastGazeCoordinatesRef.current = { x, y };
    const previousTarget = lastHoveredElementRef.current;
    const hasActiveDwell =
      dwellStartRef.current !== null && !dwellActivatedRef.current;
    const stickinessBoost = hasActiveDwell ? ACTIVE_DWELL_STICKINESS_BOOST : 0;
    const stickyTarget =
      previousTarget &&
      previousTarget.isConnected &&
      isPointNearTarget(previousTarget, x, y, stickinessBoost)
        ? previousTarget
        : null;
    const rawTarget = resolveInteractiveTargetAtPoint(x, y);
    let target = stickyTarget ?? rawTarget;

    if (!target && previousTarget && previousTarget.isConnected) {
      const now = Date.now();
      if (targetLostAtRef.current === null) {
        targetLostAtRef.current = now;
      }

      if (now - targetLostAtRef.current < TARGET_LOST_GRACE_MS) {
        target = previousTarget;
      }
    } else {
      targetLostAtRef.current = null;
    }

    if (target && isSelfManagedGazeTarget(target)) {
      if (lastHoveredElementRef.current) {
        dispatchPointerHoverEvent(
          lastHoveredElementRef.current,
          "pointerleave",
          x,
          y,
        );
        dispatchPointerHoverEvent(
          lastHoveredElementRef.current,
          "pointerout",
          x,
          y,
        );
        dispatchHoverEvent(
          lastHoveredElementRef.current,
          "mouseleave",
          x,
          y,
        );
        dispatchHoverEvent(
          lastHoveredElementRef.current,
          "mouseout",
          x,
          y,
        );
      }
      lastHoveredElementRef.current = null;
      targetLostAtRef.current = null;
      clearInteractiveDwell();
      return;
    }

    if (target !== lastHoveredElementRef.current) {
      if (lastHoveredElementRef.current) {
        dispatchPointerHoverEvent(lastHoveredElementRef.current, "pointerleave", x, y);
        dispatchPointerHoverEvent(lastHoveredElementRef.current, "pointerout", x, y);
        dispatchHoverEvent(lastHoveredElementRef.current, "mouseleave", x, y);
        dispatchHoverEvent(lastHoveredElementRef.current, "mouseout", x, y);
      }

      if (target) {
        dispatchPointerHoverEvent(target, "pointerenter", x, y);
        dispatchPointerHoverEvent(target, "pointerover", x, y);
        dispatchHoverEvent(target, "mouseenter", x, y);
        dispatchHoverEvent(target, "mouseover", x, y);
      }

      lastHoveredElementRef.current = target;

      if (target) {
        startInteractiveDwell(target);
      } else {
        clearInteractiveDwell();
      }
      return;
    }
  }, [
    clearHoveredTarget,
    clearInteractiveDwell,
    eyeState.isTracking,
    gazePos,
    startInteractiveDwell,
  ]);

  // Record gaze samples for heatmap
  useEffect(() => {
    if (eyeState.isTracking) {
      addGazeSample(gazePos.x, gazePos.y);
      setGazePosition(gazePos.x, gazePos.y);
    }
  }, [gazePos, eyeState.isTracking, addGazeSample, setGazePosition]);

  // Sustained gaze logic for emergency button
  useEffect(() => {
    const isOverEmergency = 
      gazePos.x > 0.8 && gazePos.x < 1.0 && 
      gazePos.y > 0.8 && gazePos.y < 1.0;

    if (isOverEmergency && !isEmergencyHovered) {
      setIsEmergencyHovered(true);
      emergencyTimerRef.current = setTimeout(() => {
        triggerEmergency();
        toast.error("Emergency Triggered by Gaze!");
      }, 2000); // 2 seconds sustained gaze
    } else if (!isOverEmergency && isEmergencyHovered) {
      setIsEmergencyHovered(false);
      if (emergencyTimerRef.current) {
        clearTimeout(emergencyTimerRef.current);
        emergencyTimerRef.current = null;
      }
    }
  }, [gazePos, isEmergencyHovered, triggerEmergency]);

  useEffect(() => {
    return () => {
      clearHoveredTarget();
      clearInteractiveDwell();
      if (emergencyTimerRef.current) {
        clearTimeout(emergencyTimerRef.current);
      }
    };
  }, [clearHoveredTarget, clearInteractiveDwell]);

  return (
    <>
      {/* Hidden video elements for MediaPipe */}
      <video
        ref={videoRef}
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
      />
      <video
        ref={handVideoRef}
        className="fixed top-0 right-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
      />

      {/* Fallback emergency control when not using the communication layout bottom bar */}
      {currentScreen !== "landing" &&
        currentScreen !== "communication" &&
        currentScreen !== "calibration" && (
          <div
            className={`fixed bottom-8 right-8 z-50 flex h-28 w-28 items-center justify-center rounded-full border-4 transition-colors duration-200 ${
              isEmergencyHovered
                ? "border-white bg-red-600 shadow-lg shadow-red-500/40"
                : "border-red-500/40 bg-red-900/60"
            }`}
          >
            <div className="text-center text-[10px] font-bold leading-tight text-white">
              EMERGENCY
              <br />
              GAZE 2S
            </div>
            {isEmergencyHovered && (
              <div className="pointer-events-none absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent" />
            )}
          </div>
        )}

      {cameraReady && eyeState.isTracking && (
        <GazeCursorOverlay visible />
      )}
    </>
  );
}
