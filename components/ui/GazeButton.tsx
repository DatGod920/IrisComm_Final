"use client";

import { cn } from "@/lib/utils";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEventHandler,
} from "react";
import { useAppStore } from "@/lib/store";

interface GazeButtonProps {
  title?: string;
  children?: ReactNode;
  variant?: "default" | "primary" | "secondary" | "emergency" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  dwellTime?: number;
  gazeStickiness?: number;
  onGazeSelect?: () => void;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  showProgress?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function GazeButton({
  title,
  children,
  variant = "default",
  size = "lg",
  dwellTime = 1500,
  gazeStickiness = 24,
  onGazeSelect,
  onClick,
  disabled = false,
  loading = false,
  showProgress = true,
  icon,
  className,
}: GazeButtonProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gazePosition = useAppStore((state) => state.gazePosition);
  const isCalibrated = useAppStore((state) => state.isCalibrated);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const gazeFiredRef = useRef(false);

  const variants = {
    default: "bg-white/5 border-white/10 hover:bg-white/10 text-white",
    primary:
      "bg-gradient-to-r from-primary to-secondary border-primary/50 text-primary-foreground",
    secondary: "bg-white/10 border-white/20 hover:bg-white/15 text-white",
    emergency:
      "bg-gradient-to-r from-red-600 to-red-700 border-red-500/50 text-white",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 border-green-500/50 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[52px]",
    md: "px-6 py-3 text-base min-h-[60px]",
    lg: "px-8 py-4 text-lg min-h-[72px]",
    xl: "px-10 py-5 text-xl min-h-[80px]",
  };

  const stopDwell = useCallback(() => {
    setIsHovering(false);
    setProgress(0);
    startTimeRef.current = null;
    gazeFiredRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startDwell = useCallback(() => {
    if (disabled || loading) return;
    if (isHovering) return;

    setIsHovering(true);
    setProgress(0);
    gazeFiredRef.current = false;
    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (!gazeFiredRef.current) {
          gazeFiredRef.current = true;
          onGazeSelect?.();
        }
        stopDwell();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [disabled, loading, isHovering, dwellTime, onGazeSelect, stopDwell]);

  useEffect(() => {
    if (!isCalibrated || disabled || loading || !buttonRef.current) {
      stopDwell();
      return;
    }

    const vw = typeof window !== "undefined" ? window.innerWidth : 1;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1;
    const clientX = gazePosition.x * vw;
    const clientY = gazePosition.y * vh;

    const rect = buttonRef.current.getBoundingClientRect();
    const pad = gazeStickiness;
    const inBounds =
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad;

    if (inBounds && !isHovering) {
      startDwell();
    } else if (!inBounds && isHovering) {
      stopDwell();
    }
  }, [
    gazePosition,
    isCalibrated,
    disabled,
    loading,
    isHovering,
    gazeStickiness,
    startDwell,
    stopDwell,
  ]);

  useEffect(() => {
    return () => {
      stopDwell();
    };
  }, [stopDwell]);

  const handleMouseEnter = () => {
    if (disabled || loading) return;
    setIsHovering(true);
    setProgress(0);
    gazeFiredRef.current = false;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100 && onGazeSelect && !gazeFiredRef.current) {
        gazeFiredRef.current = true;
        onGazeSelect();
        setIsHovering(false);
        setProgress(0);
      } else if (newProgress < 100) {
        timerRef.current = setTimeout(animate, 16);
      }
    };

    animate();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setProgress(0);
    gazeFiredRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!disabled && !loading) {
      onClick?.(event);
    }
  };

  const content = children ?? title;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <button
      ref={buttonRef}
      type="button"
      data-gaze-interactive="true"
      data-gaze-skip-global-dwell="true"
      data-gaze-dwell={dwellTime}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 font-semibold",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {showProgress && isHovering && progress > 0 && (
        <div
          className="pointer-events-none absolute inset-0 bg-foreground/15"
          style={{ width: `${progress}%` }}
        />
      )}

      {showProgress && isHovering && (
        <svg
          className="pointer-events-none absolute right-2 top-2 h-12 w-12"
          viewBox="0 0 56 56"
          aria-hidden
        >
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-foreground/20"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="text-primary"
            transform="rotate(-90 28 28)"
          />
        </svg>
      )}

      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            {icon && <span className="text-2xl">{icon}</span>}
            {content}
          </>
        )}
      </span>
    </button>
  );
}
