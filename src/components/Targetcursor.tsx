import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   TargetCursor
   Eigenständige Komponente, konzeptionell an
   reactbits.dev/animations/target-cursor angelehnt,
   aber komplett neu gebaut (kein 1:1-Quellcode-Zugriff)
   und im Cyan-Look der Seite umgesetzt.

   Verwendung:
   1. <TargetCursor /> einmal ganz oben in MainPage.tsx
   2. Elemente, die "anvisiert" werden sollen, bekommen
      die Klasse "cursor-target" (z. B. Cards, Buttons, Links)
───────────────────────────────────────────── */

const TARGET_SELECTOR = ".cursor-target";
const IDLE_SIZE = 10;
const PADDING = 10;

export default function TargetCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasFinePointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    const ring = ringRef.current!;
    const dot = dotRef.current!;
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    // Interpoliert Position des Rings im Idle-Modus (freies Folgen)
    let ringX = mouseX;
    let ringY = mouseY;
    let prevRingX = ringX;
    let prevRingY = ringY;
    let currentTarget: HTMLElement | null = null;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const setTargetTransform = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      ring.style.transition =
        "width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), " +
        "left 0.25s cubic-bezier(0.16,1,0.3,1), top 0.25s cubic-bezier(0.16,1,0.3,1)";
      ring.style.filter = "none";
      ring.style.transform = "none";
      ring.style.width = `${rect.width + PADDING * 2}px`;
      ring.style.height = `${rect.height + PADDING * 2}px`;
      ring.style.left = `${rect.left - PADDING}px`;
      ring.style.top = `${rect.top - PADDING}px`;
      ringX = rect.left + rect.width / 2;
      ringY = rect.top + rect.height / 2;
      prevRingX = ringX;
      prevRingY = ringY;
    };

    // Free-roam Loop: sanftes Nachziehen (Lerp) + Motion Blur/Stretch
    // je nach Geschwindigkeit — läuft nur, solange kein Target gelockt ist.
    const animate = () => {
      if (!currentTarget) {
        ringX = lerp(ringX, mouseX, 0.22);
        ringY = lerp(ringY, mouseY, 0.22);

        const vx = ringX - prevRingX;
        const vy = ringY - prevRingY;
        const speed = Math.hypot(vx, vy);

        const blur = Math.min(speed * 0.4, 6);
        const stretch = 1 + Math.min(speed * 0.035, 0.9);
        const angle = speed > 0.15 ? Math.atan2(vy, vx) * (180 / Math.PI) : 0;

        ring.style.transition = "none";
        ring.style.width = `${IDLE_SIZE}px`;
        ring.style.height = `${IDLE_SIZE}px`;
        ring.style.left = `${ringX - IDLE_SIZE / 2}px`;
        ring.style.top = `${ringY - IDLE_SIZE / 2}px`;
        ring.style.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px)` : "none";
        ring.style.transform = `rotate(${angle.toFixed(1)}deg) scaleX(${stretch.toFixed(2)})`;

        prevRingX = ringX;
        prevRingY = ringY;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        TARGET_SELECTOR,
      );
      if (!el) return;
      currentTarget = el;
      setActive(true);
      setTargetTransform(el);
    };

    const onOut = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        TARGET_SELECTOR,
      );
      if (!el || el !== currentTarget) return;
      currentTarget = null;
      setActive(false);
      // Nahtlos zurück ins freie Folgen, ohne Sprung
      ringX = mouseX;
      ringY = mouseY;
      prevRingX = ringX;
      prevRingY = ringY;
    };

    const onScrollOrResize = () => {
      if (currentTarget) setTargetTransform(currentTarget);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.cursor = prevCursor;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <>
      <style>{`
        .target-cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          margin: -2px 0 0 -2px;
          border-radius: 50%;
          background: #00d2ff;
          box-shadow: 0 0 6px rgba(0, 210, 255, 0.9);
          pointer-events: none;
          z-index: 9999;
        }

        .target-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9998;
          will-change: transform, filter, left, top, width, height;
        }

        .target-cursor-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 1.5px solid rgba(0, 210, 255, 0.9);
          filter: drop-shadow(0 0 4px rgba(0, 210, 255, 0.8));
          transition: width 0.25s ease, height 0.25s ease;
        }

        .target-cursor-ring.active .target-cursor-corner {
          width: 16px;
          height: 16px;
        }

        .corner-tl { top: -1.5px; left: -1.5px; border-right: none; border-bottom: none; }
        .corner-tr { top: -1.5px; right: -1.5px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: -1.5px; left: -1.5px; border-right: none; border-top: none; }
        .corner-br { bottom: -1.5px; right: -1.5px; border-left: none; border-top: none; }
      `}</style>

      <div ref={dotRef} className="target-cursor-dot" />
      <div
        ref={ringRef}
        className={`target-cursor-ring ${active ? "active" : "idle"}`}
      >
        <span className="target-cursor-corner corner-tl" />
        <span className="target-cursor-corner corner-tr" />
        <span className="target-cursor-corner corner-bl" />
        <span className="target-cursor-corner corner-br" />
      </div>
    </>
  );
}
