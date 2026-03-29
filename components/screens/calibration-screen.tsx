"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GazeButton } from "@/components/ui/GazeButton";
import { useAppStore } from "@/lib/store";
import { ASSISTIVE_DWELL_MS } from "@/hooks/useGazeInteraction";
import { cn } from "@/lib/utils";

const STEPS = 9;

/**
 * Fullscreen, non-scrolling calibration: GazeCloud handles vendor calibration;
 * this screen adds a fixed 9-point dwell sequence and live offset feedback
 * without changing DOM structure height between steps (only highlights move).
 */
export function CalibrationScreen() {
  const {
    isCalibrated: apiReady,
    dwellTime,
    setCalibrationProgress,
    setCurrentScreen,
  } = useAppStore();

  const gazePosition = useAppStore((s) => s.gazePosition);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"dots" | "done">("dots");
  const activeDotRef = useRef<HTMLDivElement | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  const dwellMs = Math.max(dwellTime, ASSISTIVE_DWELL_MS);

  useEffect(() => {
    if (!activeDotRef.current || typeof window === "undefined") {
      return;
    }
    const rect = activeDotRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const gx = gazePosition.x * window.innerWidth;
    const gy = gazePosition.y * window.innerHeight;
    setOffsetPx(Math.round(Math.hypot(gx - cx, gy - cy)));
  }, [gazePosition.x, gazePosition.y, step, phase]);

  const advance = useCallback(() => {
    if (step < STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    setPhase("done");
    setCalibrationProgress(100);
  }, [step, setCalibrationProgress]);

  const finishToCommunication = useCallback(() => {
    setCurrentScreen("communication");
  }, [setCurrentScreen]);

  const statusLine = useMemo(() => {
    if (!apiReady) {
      return "Follow the GazeCloud camera prompts. API status: calibrating…";
    }
    return "GazeCloud reports calibrated. Complete the 9-point dwell check below.";
  }, [apiReady]);

  return (
    <div className="grid h-[100dvh] w-screen grid-rows-[auto_1fr_auto] overflow-hidden bg-background p-4 text-foreground">
      <Card className="shrink-0 rounded-xl border shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Calibration
          </CardTitle>
          <p className="text-sm text-muted-foreground">{statusLine}</p>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-sm font-medium",
              apiReady ? "text-emerald-500" : "text-amber-500",
            )}
          >
            {apiReady ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            )}
            {apiReady ? "API ready" : "Waiting for API calibration"}
          </div>
        </CardHeader>
      </Card>

      <div className="min-h-0 overflow-hidden py-3">
        {phase === "dots" ? (
          <Card className="flex h-full min-h-0 flex-col rounded-xl border shadow-none">
            <CardHeader className="shrink-0 p-4 pb-2">
              <p className="text-sm text-muted-foreground">
                Look at the highlighted target until the ring completes (
                {step + 1}/{STEPS}). Offset from center:{" "}
                <span className="font-mono text-foreground">{offsetPx}px</span>
              </p>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-hidden p-4 pt-0">
              <div className="grid h-full min-h-0 grid-cols-3 grid-rows-3 gap-3">
                {Array.from({ length: STEPS }).map((_, i) => {
                  const isActive = i === step;
                  return (
                    <div
                      key={i}
                      className="flex min-h-0 items-center justify-center"
                    >
                      <div
                        ref={isActive ? activeDotRef : undefined}
                        className="flex w-full max-w-[min(100%,12rem)] flex-col items-center justify-center"
                      >
                        {isActive ? (
                          <GazeButton
                            variant="primary"
                            size="lg"
                            dwellTime={dwellMs}
                            gazeStickiness={32}
                            onGazeSelect={advance}
                            onClick={advance}
                            className="h-24 w-full max-w-[12rem] text-lg"
                          >
                            {i + 1}
                          </GazeButton>
                        ) : (
                          <div
                            className={cn(
                              "flex h-24 w-full max-w-[12rem] items-center justify-center rounded-xl border-4 text-lg font-semibold text-muted-foreground",
                              i < step
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : "border-muted bg-muted/30",
                            )}
                          >
                            {i + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col items-center justify-center rounded-xl border shadow-none">
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <CheckCircle2
                className="h-16 w-16 text-emerald-500"
                aria-hidden
              />
              <p className="max-w-md text-center text-lg text-muted-foreground">
                Point calibration finished. You can start communicating.
              </p>
              <GazeButton
                variant="primary"
                size="xl"
                dwellTime={dwellMs}
                onGazeSelect={finishToCommunication}
                onClick={finishToCommunication}
              >
                Open communication
              </GazeButton>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground">
        Fixed layout — no page scroll. Dwell ~{(dwellMs / 1000).toFixed(1)}s per
        target.
      </div>
    </div>
  );
}
