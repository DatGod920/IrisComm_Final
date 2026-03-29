"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";

const CURSOR_SIZE = 20;
const HALF = CURSOR_SIZE / 2;

/**
 * Visible gaze dot using left/top only (no CSS transform) so viewport mapping
 * stays aligned with GazeCloud doc coordinates.
 */
export function GazeCursorOverlay({
  visible,
  smoothing = 0.38,
}: {
  visible: boolean;
  /** 0–1, higher = follow raw gaze more closely */
  smoothing?: number;
}) {
  const gazePosition = useAppStore((s) => s.gazePosition);
  const smoothRef = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !visible) return;

    const rawX = gazePosition.x * window.innerWidth;
    const rawY = gazePosition.y * window.innerHeight;

    if (!smoothRef.current) {
      smoothRef.current = { x: rawX, y: rawY };
    } else {
      smoothRef.current = {
        x: smoothing * rawX + (1 - smoothing) * smoothRef.current.x,
        y: smoothing * rawY + (1 - smoothing) * smoothRef.current.y,
      };
    }

    const { x, y } = smoothRef.current;
    setPos({
      left: Math.round(x - HALF),
      top: Math.round(y - HALF),
    });
  }, [gazePosition.x, gazePosition.y, smoothing, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[100] rounded-full border-2 border-primary bg-primary/35 mix-blend-difference"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        left: pos.left,
        top: pos.top,
      }}
    />
  );
}
