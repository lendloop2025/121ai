"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type RevealVariant = "up" | "fade" | "left" | "right" | "zoom" | "stagger";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  delayMs?: number;
  /** Trigger when this fraction of the element is visible (0–1). */
  threshold?: number;
  /** Animate only once (default true). */
  once?: boolean;
}

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "reveal",
  fade: "reveal-fade",
  left: "reveal-left",
  right: "reveal-right",
  zoom: "reveal-zoom",
  stagger: "reveal-stagger",
};

export function Reveal({
  children,
  variant = "up",
  className = "",
  delayMs,
  threshold = 0.18,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const cls = [VARIANT_CLASS[variant], visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  const style = delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;

  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  );
}
