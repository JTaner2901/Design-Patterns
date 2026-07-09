import { useEffect, useRef, useState } from "react";
import { GridScan } from "./GridScan";

/* ─────────────────────────────────────────────
   PanelGuideSection — erklärt das Control Panel
   des Prototyps in 8 Karten, eine pro Steuerungs-
   Kategorie. Hintergrund: GridScan (Webcam komplett
   aus), Farben auf das Cyan-Theme der Seite umgestellt.
───────────────────────────────────────────── */

interface GuideItem {
  icon: string;
  title: string;
  text: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    icon: "▦",
    title: "Geometry",
    text: "Rows, Cols und Spread bestimmen Größe und Dichte des Rasters.",
  },
  {
    icon: "◆",
    title: "Shape",
    text: "Sechs Grundformen zur Wahl: Würfel, Kugel, Kegel, Torus, Zylinder, Stern.",
  },
  {
    icon: "◯",
    title: "Distribution",
    text: "Wie sich die Formen im Raum anordnen — als Kugel, flaches Raster, Fibonacci-Spirale oder Doppelhelix.",
  },
  {
    icon: "⬡",
    title: "Modes",
    text: "Organic, Morph und Mixed verändern, wie sich einzelne Formen verhalten.",
  },
  {
    icon: "↻",
    title: "Rotation",
    text: "Automatische Drehung des gesamten Musters, Geschwindigkeit frei einstellbar.",
  },
  {
    icon: "⟳",
    title: "Spiral Drift",
    text: "Einzelne Reihen driften spiralförmig gegeneinander statt starr zu rotieren.",
  },
  {
    icon: "✺",
    title: "Explode",
    text: "Burst löst eine einmalige Explosion aus, Pulse wiederholt sie automatisch im Takt.",
  },
  {
    icon: "●",
    title: "Color",
    text: "Fünf Farbpaletten über den Dial wählbar — oder Cycle für automatischen Farbwechsel.",
  },
];

function GuideCard({ item, index, visible }: { item: GuideItem; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="cursor-target"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "22px 20px",
        borderRadius: "10px",
        background: hovered ? "rgba(0,180,255,0.06)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? "rgba(0,210,255,0.4)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? "0 0 30px rgba(0,180,255,0.12)" : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(22px)",
        transition:
          "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, " +
          `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 70}ms, ` +
          `transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 70}ms`,
      }}
    >
      <span
        style={{
          fontSize: "1.4rem",
          color: "rgba(0,210,255,0.9)",
          textShadow: "0 0 12px rgba(0,210,255,0.6)",
          lineHeight: 1,
        }}
      >
        {item.icon}
      </span>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#fff",
        }}
      >
        {item.title}
      </span>
      <p
        style={{
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.8rem",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {item.text}
      </p>
    </div>
  );
}

export default function PanelGuideSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;600;700;800&display=swap');

        .guide-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
          max-width: 1024px;
        }

        @media (max-width: 860px) {
          .guide-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .guide-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          padding: "96px 24px",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "56px",
        }}
      >
        {/* GridScan Hintergrund — Webcam komplett aus, nur der reine Scan-Effekt */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.6,
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.35) 65%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.35) 65%, transparent 100%)",
          }}
        >
          <GridScan
            enableWebcam={false}
            showPreview={false}
            enableGyro={false}
            scanOnClick={false}
            linesColor="#0a2a38"
            scanColor="#00d2ff"
            scanOpacity={0.5}
            gridScale={0.14}
            lineThickness={1}
            lineStyle="solid"
            lineJitter={0.05}
            scanDirection="pingpong"
            scanDuration={3}
            scanDelay={1.5}
            scanGlow={0.6}
            scanSoftness={2}
            bloomIntensity={0.4}
            chromaticAberration={0.0012}
            noiseIntensity={0.015}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "56px",
            width: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.65rem",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "rgba(0,210,255,0.75)",
              }}
            >
              Steuerung
            </span>

            <h2
              style={{
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                WebkitTextStroke: "0.5px rgba(0,210,255,0.7)",
                textShadow: "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
              }}
            >
              Das Control Panel
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: "480px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
              }}
            >
              Acht Kategorien, jeder Parameter live veränderbar — hier ein
              kurzer Überblick, bevor du selbst dran bist.
            </p>

            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(0,210,255,0.9), transparent)",
                boxShadow: "0 0 8px rgba(0,210,255,0.7)",
              }}
            />
          </div>

          {/* Cards */}
          <div className="guide-grid">
            {GUIDE_ITEMS.map((item, i) => (
              <GuideCard key={item.title} item={item} index={i} visible={visible} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
