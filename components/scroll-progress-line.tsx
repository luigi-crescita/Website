"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";

const CANVAS_WIDTH = 88;
const STROKE_WIDTH = 8;
const SEGMENT_HEIGHT = 550; // px of page height per wave bend
const AMPLITUDE: [number, number] = [18, 70]; // x range the curve wanders between

function buildPath(pageHeight: number) {
  if (pageHeight <= 0) return "";
  const segments = Math.max(2, Math.ceil(pageHeight / SEGMENT_HEIGHT));
  const points = Array.from({ length: segments + 1 }, (_, i) => ({
    x: i % 2 === 0 ? AMPLITUDE[0] : AMPLITUDE[1],
    y: (pageHeight / segments) * i,
  }));
  return points.slice(1).reduce((d, point, i) => {
    const prev = points[i];
    const midY = (prev.y + point.y) / 2;
    return `${d} C${prev.x},${midY} ${point.x},${midY} ${point.x},${point.y}`;
  }, `M${points[0].x},${points[0].y}`);
}

/**
 * One continuous curved line for the entire page (not one per section) —
 * its `pathLength` is driven by whole-document scroll progress (0 at the
 * very top, 1 at the very bottom), so the fill never resets or restarts at
 * a section boundary. Height is measured dynamically (mount + ResizeObserver
 * on <body>), so it automatically accounts for however tall the page is —
 * including the tall sticky-pinned "how it works" sequence — without any
 * section-specific logic.
 */
export function ScrollProgressLine() {
  const [pageHeight, setPageHeight] = useState(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    function measure() {
      setPageHeight(document.documentElement.scrollHeight);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 right-4 z-20 hidden lg:block xl:right-12"
      style={{ width: CANVAS_WIDTH, height: pageHeight || 1, opacity: pageHeight ? 1 : 0 }}
    >
      <svg
        width={CANVAS_WIDTH}
        height={pageHeight || 1}
        viewBox={`0 0 ${CANVAS_WIDTH} ${pageHeight || 1}`}
        className="absolute inset-0 overflow-visible"
        fill="none"
      >
        <motion.path
          d={buildPath(pageHeight)}
          className="stroke-brand-2"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
    </div>
  );
}
