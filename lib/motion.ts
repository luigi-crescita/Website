import { cubicBezier } from "animejs";

// The single easing curve every entrance animation on the site resolves to.
// Mirrors the `ease-signature` Tailwind utility (globals.css) used for CSS
// hover transitions, so JS-driven and CSS-driven motion read as one system.
export const EASE_ANIME = cubicBezier(0.16, 1, 0.3, 1);

export const DURATION = {
  fast: 350,
  base: 600,
  slow: 850,
} as const;

export const STAGGER = {
  tight: 30,
  base: 70,
} as const;
