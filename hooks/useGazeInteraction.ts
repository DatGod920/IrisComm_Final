"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useAppStore } from "@/lib/store";

/** Default dwell duration for assistive selection (ms). */
export const ASSISTIVE_DWELL_MS = 1500;

export interface UseGazeDwellTargetOptions {
  /** Called once when dwell completes (gaze stayed on target for `dwellMs`). */
  onDwellComplete: () => void;
  dwellMs?: number;
  /** When false, progress resets and no completion fires. */
  enabled?: boolean;
  /** Extra pixels around the element bounds for hit testing (reduces jitter). */
  stickinessPx?: number;
}

/**
 * Hit-tests the gaze point (from global store) against a DOM element each frame.
 * Tracks dwell progress and fires `onDwellComplete` after continuous dwell.
 * Cancelled immediately when gaze leaves the padded bounds.
 */
export function useGazeDwellTarget(
  ref: RefObject<HTMLElement | null>,
  options: UseGazeDwellTargetOptions,
): { progress: number; isDwelling: boolean } {
  const {
    onDwellComplete,
    dwellMs = ASSISTIVE_DWELL_MS,
    enabled = true,
    stickinessPx = 28,
  } = options;

  const gazePosition = useAppStore((s) => s.gazePosition);
  const isCalibrated = useAppStore((s) => s.isCalibrated);

  const [progress, setProgress] = useState(0);
  const dwellStartRef = useRef<number | null>(null);
  const dwellFiredRef = useRef(false);
  const rafRef = useRef(0);
  const onCompleteRef = useRef(onDwellComplete);

  useEffect(() => {
    onCompleteRef.current = onDwellComplete;
  }, [onDwellComplete]);

  const tick = useCallback(() => {
    if (typeof window === "undefined" || !enabled || !isCalibrated) {
      dwellStartRef.current = null;
      dwellFiredRef.current = false;
      setProgress(0);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const el = ref.current;
    if (!el) {
      dwellStartRef.current = null;
      dwellFiredRef.current = false;
      setProgress(0);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const rect = el.getBoundingClientRect();
    const cx = gazePosition.x * window.innerWidth;
    const cy = gazePosition.y * window.innerHeight;
    const pad = stickinessPx;

    const inside =
      cx >= rect.left - pad &&
      cx <= rect.right + pad &&
      cy >= rect.top - pad &&
      cy <= rect.bottom + pad;

    if (inside) {
      if (dwellStartRef.current === null) {
        dwellStartRef.current = performance.now();
        dwellFiredRef.current = false;
      }
      const elapsed = performance.now() - dwellStartRef.current;
      if (elapsed >= dwellMs) {
        setProgress(1);
        if (!dwellFiredRef.current) {
          dwellFiredRef.current = true;
          onCompleteRef.current();
        }
      } else {
        setProgress(elapsed / dwellMs);
      }
    } else {
      dwellStartRef.current = null;
      dwellFiredRef.current = false;
      setProgress(0);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [
    enabled,
    isCalibrated,
    gazePosition.x,
    gazePosition.y,
    dwellMs,
    stickinessPx,
    ref,
  ]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return {
    progress,
    isDwelling: progress > 0 && progress < 1,
  };
}

/**
 * Returns pixel coordinates for rendering a gaze cursor from normalized store gaze.
 * Optional exponential smoothing to reduce jitter without CSS transforms on layout.
 */
export function useSmoothedGazePixels(smoothing = 0.35): {
  px: number;
  py: number;
} {
  const gazePosition = useAppStore((s) => s.gazePosition);
  const smoothRef = useRef<{ x: number; y: number } | null>(null);
  const [pixels, setPixels] = useState({ px: 0, py: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targetX = gazePosition.x * window.innerWidth;
    const targetY = gazePosition.y * window.innerHeight;

    if (!smoothRef.current) {
      smoothRef.current = { x: targetX, y: targetY };
    } else {
      smoothRef.current = {
        x:
          smoothing * targetX +
          (1 - smoothing) * smoothRef.current.x,
        y:
          smoothing * targetY +
          (1 - smoothing) * smoothRef.current.y,
      };
    }

    setPixels({ px: smoothRef.current.x, py: smoothRef.current.y });
  }, [gazePosition.x, gazePosition.y, smoothing]);

  return pixels;
}
