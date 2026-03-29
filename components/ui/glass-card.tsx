"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  forwardRef,
  HTMLAttributes,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  glow?: boolean;
  hoverEffect?: boolean;
  dwellTime?: number;
  onGazeSelect?: () => void;
  showProgress?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      glow = false,
      hoverEffect = true,
      dwellTime = 800,
      onGazeSelect,
      showProgress = true,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isHovering, setIsHovering] = useState(false);
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef<number>(0);
    const animationRef = useRef<number | null>(null);
    const dwellActivatedRef = useRef(false);

    const variants = {
      default: "glass",
      strong: "glass-strong",
      subtle: "bg-card/30 backdrop-blur-sm border border-border/50",
    };

    const clearDwell = useCallback(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setProgress(0);
      startTimeRef.current = 0;
      dwellActivatedRef.current = false;
    }, []);

    useEffect(() => {
      if (isHovering && !dwellActivatedRef.current) {
        startTimeRef.current = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTimeRef.current;
          const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
          setProgress(newProgress);

          if (newProgress >= 100 && !dwellActivatedRef.current) {
            dwellActivatedRef.current = true;
            onGazeSelect?.();
          }

          if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(animate);
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      } else if (!isHovering) {
        clearDwell();
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isHovering, dwellTime, onGazeSelect, clearDwell]);

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      if (onClick) {
        onClick(event);
        return;
      }
      onGazeSelect?.();
    };

    // Filter out React/DOM event handler props that conflict with framer-motion
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;

    return (
      <motion.div
        ref={ref}
        data-gaze-interactive="true"
        data-gaze-dwell={dwellTime}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={hoverEffect ? { scale: 1.02, y: -5 } : undefined}
        className={cn(
          "relative overflow-hidden rounded-2xl p-4",
          variants[variant],
          glow && "animate-pulse-glow",
          hoverEffect && "transition-all duration-300 cursor-pointer",
          className,
        )}
        {...motionProps}
      >
        {showProgress && isHovering && (
          <motion.div
            className="absolute inset-0 bg-foreground/20 pointer-events-none"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            style={{ transformOrigin: "left" }}
          />
        )}

        {isHovering && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(79, 70, 229, 0.4)",
                "0 0 0 8px rgba(79, 70, 229, 0)",
              ],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
