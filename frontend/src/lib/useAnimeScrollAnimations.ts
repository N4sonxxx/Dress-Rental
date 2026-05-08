"use client";
import { useEffect } from "react";
import anime from "animejs";

type AnimationOptions = {
  rootMargin?: string;
  threshold?: number;
};

const DEFAULT_DURATION = 720;
const DEFAULT_DELAY = 0;
const DEFAULT_EASING = "easeOutExpo";

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getAnimationPreset(name: string | null) {
  switch (name) {
    case "fade-left":
      return { opacity: [0, 1], translateX: [28, 0], scale: [0.98, 1] };
    case "fade-right":
      return { opacity: [0, 1], translateX: [-28, 0], scale: [0.98, 1] };
    case "fade-up":
    default:
      return { opacity: [0, 1], translateY: [28, 0], scale: [0.98, 1] };
  }
}

export function useAnimeScrollAnimations(options: AnimationOptions = {}) {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-anim]")
    );

    if (elements.length === 0) return;

    elements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(28px) scale(0.98)";
      element.style.willChange = "opacity, transform";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          const preset = getAnimationPreset(target.dataset.anim || "fade-up");
          const delay = parseNumber(target.dataset.delay, DEFAULT_DELAY);
          const duration = parseNumber(target.dataset.duration, DEFAULT_DURATION);

          anime({
            targets: target,
            ...preset,
            duration,
            delay,
            easing: DEFAULT_EASING,
          });

          observer.unobserve(target);
        });
      },
      {
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
        threshold: options.threshold ?? 0.2,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);
}
