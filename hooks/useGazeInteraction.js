"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_DWELL_MS = 1500;

/**
 * @typedef {import('react').MutableRefObject<{ x: number; y: number } | null | undefined>} GazeRef
 */

/**
 * Pick the smallest intersecting target (by bbox area) so nested fixed-layout
 * buttons resolve predictably without z-index heuristics.
 *
 * @param {number} cx
 * @param {number} cy
 * @param {Map<string, import('react').RefObject<HTMLElement | null>>} registry
 * @param {number} padPx
 * @returns {string | null}
 */
function pickHoveredId(cx, cy, registry, padPx) {
  let bestId = null;
  let bestArea = Infinity;

  for (const [id, elementRef] of registry) {
    const el = elementRef?.current;
    if (!el || typeof el.getBoundingClientRect !== "function") continue;

    const r = el.getBoundingClientRect();
    const left = r.left - padPx;
    const right = r.right + padPx;
    const top = r.top - padPx;
    const bottom = r.bottom + padPx;

    if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
      const area = Math.max(0, r.width) * Math.max(0, r.height);
      if (area < bestArea) {
        bestArea = area;
        bestId = id;
      }
    }
  }

  return bestId;
}

/**
 * Gaze dwell interaction over a registry of element refs (fixed layout friendly).
 *
 * - Reads normalized gaze `{ x, y }` in [0,1] from `gazeRef` each animation frame
 *   (update that ref from your gaze source; avoids React re-render coupling).
 * - Hit-test via `getBoundingClientRect()` only — no layout assumptions beyond vendor coords.
 *
 * @param {object} options
 * @param {GazeRef} options.gazeRef mutable `{ x, y }` in viewport-normalized [0, 1]
 * @param {number} [options.dwellMs]
 * @param {(id: string) => void} [options.onDwellComplete] fired once per dwell completion
 * @param {number} [options.stickinessPx] expand hit boxes (reduces jitter)
 * @returns {{
 *   gazeX: number,
 *   gazeY: number,
 *   progress: number,
 *   hoveredId: string | null,
 *   registerTarget: (id: string, elementRef: import('react').RefObject<HTMLElement | null>) => () => void,
 * }}
 */
export function useGazeInteraction(options) {
  const {
    gazeRef,
    dwellMs = DEFAULT_DWELL_MS,
    onDwellComplete,
    stickinessPx = 0,
  } = options ?? {};

  const registryRef = useRef(
    /** @type {Map<string, import('react').RefObject<HTMLElement | null>>} */ (
      new Map()
    ),
  );

  const dwellTargetIdRef = useRef(/** @type {string | null} */ (null));
  const dwellStartRef = useRef(/** @type {number | null} */ (null));
  const dwellFiredRef = useRef(false);
  const onDwellCompleteRef = useRef(onDwellComplete);
  onDwellCompleteRef.current = onDwellComplete;

  const [gazeX, setGazeX] = useState(0.5);
  const [gazeY, setGazeY] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState(/** @type {string | null} */ (null));

  const registerTarget = useCallback((id, elementRef) => {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("useGazeInteraction.registerTarget: id must be a non-empty string");
    }
    registryRef.current.set(id, elementRef);
    return () => {
      registryRef.current.delete(id);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let rafId = 0;

    const loop = () => {
      const g = gazeRef?.current;
      const nx = typeof g?.x === "number" ? g.x : 0.5;
      const ny = typeof g?.y === "number" ? g.y : 0.5;

      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      const cx = nx * vw;
      const cy = ny * vh;

      const bestId = pickHoveredId(
        cx,
        cy,
        registryRef.current,
        stickinessPx,
      );

      if (bestId !== dwellTargetIdRef.current) {
        dwellTargetIdRef.current = bestId;
        dwellStartRef.current = bestId ? performance.now() : null;
        dwellFiredRef.current = false;
      }

      let p = 0;
      if (
        bestId &&
        dwellStartRef.current !== null &&
        !dwellFiredRef.current
      ) {
        const elapsed = performance.now() - dwellStartRef.current;
        p = Math.min(elapsed / dwellMs, 1);
        if (p >= 1) {
          dwellFiredRef.current = true;
          const cb = onDwellCompleteRef.current;
          if (typeof cb === "function") cb(bestId);
          p = 0;
          dwellStartRef.current = null;
        }
      }

      setGazeX(nx);
      setGazeY(ny);
      setProgress(p);
      setHoveredId(bestId);

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [gazeRef, dwellMs, stickinessPx]);

  return {
    gazeX,
    gazeY,
    progress,
    hoveredId,
    registerTarget,
  };
}
