"use client";

import { useCallback, useEffect, useRef } from "react";

type Chispa = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number; rot: number };
const COLORES = ["#4B3FA6", "#6B5DD3", "#B87333", "#2E7D4F", "#C98A12"];

/**
 * Celebración al completar un taller. Misma física que el prototipo.
 * Se llama por imperativo desde donde se detecta el logro.
 */
export function useConfeti() {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const chispas = useRef<Chispa[]>([]);
  const raf = useRef<number | null>(null);

  const tick = useCallback(() => {
    const cv = canvas.current;
    const cx = cv?.getContext("2d");
    if (!cv || !cx) return;
    cx.clearRect(0, 0, cv.width, cv.height);
    chispas.current = chispas.current.filter((p) => p.a > 0.02);
    for (const p of chispas.current) {
      p.vy += 0.34; p.x += p.vx; p.y += p.vy; p.a -= 0.011; p.rot += 0.12;
      cx.save();
      cx.globalAlpha = Math.max(p.a, 0);
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.fillStyle = p.c;
      cx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      cx.restore();
    }
    raf.current = chispas.current.length ? requestAnimationFrame(tick) : null;
  }, []);

  const lanzar = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = canvas.current;
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    for (let i = 0; i < 70; i++) {
      chispas.current.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 160,
        y: window.innerHeight * 0.42,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 11 - 3,
        r: 2 + Math.random() * 4,
        c: COLORES[i % COLORES.length]!,
        a: 1,
        rot: Math.random() * 6,
      });
    }
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); }, []);

  const Lienzo = useCallback(
    () => <canvas id="fx" ref={canvas} aria-hidden="true" />, []);

  return { lanzar, Lienzo };
}
