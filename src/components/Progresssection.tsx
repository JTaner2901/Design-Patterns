import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

/* ─────────────────────────────────────────────
   Step 1 — Prototyp: 1:1 Rekonstruktion des
   ursprünglichen p5.js-Sketches (Kugel aus Würfeln,
   per Maus drehbar). Farben bewusst NICHT an das
   Cyan-Theme angepasst — das war der echte erste Look.
───────────────────────────────────────────── */

const BASE_W = 710;
const BASE_H = 400;

function PrototypePreview({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    let scaleFactor = 1;

    const sketch = (p: p5) => {
      p.setup = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        scaleFactor = w / BASE_W;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
        p.strokeWeight(5 * scaleFactor);
        p.noFill();
        p.stroke(32, 8, 64);
      };

      p.draw = () => {
        p.background(250, 180, 200);
        // Maus/Touch zum Drehen der Perspektive — wie im Original
        p.orbitControl();
        for (let zAngle = 0; zAngle < 180; zAngle += 30) {
          for (let xAngle = 0; xAngle < 360; xAngle += 30) {
            p.push();
            p.rotateZ(zAngle);
            p.rotateX(xAngle);
            p.translate(0, 400 * scaleFactor, 0);
            p.box(100 * scaleFactor);
            p.pop();
          }
        }
      };

      p.windowResized = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        scaleFactor = w / BASE_W;
        p.resizeCanvas(w, h);
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, [active]);

  return (
    <div
      className="cursor-target"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${BASE_W} / ${BASE_H}`,
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid rgba(0,210,255,0.15)",
        background: "rgb(250,180,200)",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          right: "14px",
          color: "rgba(32,8,64,0.55)",
          fontFamily: "monospace",
          fontSize: "10px",
          pointerEvents: "none",
        }}
      >
        ziehen zum drehen
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 2 — Animation: Video (folgt später),
   bis dahin ein Platzhalter im Sekunden-Look
───────────────────────────────────────────── */

function VideoPlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, rgba(0,180,255,0.06) 0%, rgba(0,0,0,0.6) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,210,255,0.025) 3px, rgba(0,210,255,0.025) 4px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid rgba(0,210,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,180,255,0.08)",
          zIndex: 1,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ marginLeft: 3 }}
        >
          <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="rgba(0,210,255,0.7)" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          zIndex: 1,
        }}
      >
        Video folgt
      </span>
    </div>
  );
}

function AnimationPreview({ video }: { video?: string }) {
  return (
    <div
      className="cursor-target"
      style={{
        width: "100%",
        aspectRatio: `${BASE_W} / ${BASE_H}`,
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid rgba(0,210,255,0.15)",
      }}
    >
      {video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <VideoPlaceholder />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step Row
───────────────────────────────────────────── */

interface Step {
  number: string;
  eyebrow: string;
  title: string;
  text: string;
  visual: React.ReactNode;
}

function StepRow({
  step,
  reverse,
  visible,
}: {
  step: Step;
  reverse: boolean;
  visible: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "56px",
        alignItems: "center",
        width: "100%",
        direction: reverse ? "rtl" : "ltr",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(32px)",
        transition:
          "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}
      className="progress-row"
    >
      {/* Text */}
      <div
        style={{
          direction: "ltr",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid rgba(0,210,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "rgba(0,210,255,0.9)",
              flexShrink: 0,
            }}
          >
            {step.number}
          </span>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(0,210,255,0.75)",
            }}
          >
            {step.eyebrow}
          </span>
        </div>

        <h3
          style={{
            margin: 0,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "#fff",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            WebkitTextStroke: "0.4px rgba(0,210,255,0.6)",
            textShadow: "0 0 30px rgba(0,180,255,0.25)",
          }}
        >
          {step.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.8,
            letterSpacing: "0.01em",
          }}
        >
          {step.text}
        </p>
      </div>

      {/* Visual */}
      <div style={{ direction: "ltr" }}>{step.visual}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */

export default function ProgressSection() {
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

  const steps: Step[] = [
    {
      number: "01",
      eyebrow: "Prototyp",
      title: "Der erste Test im Raum",
      text: "Am Anfang stand die Idee: ein Muster im Raum, mit dem man spielen und das man erweitern kann. Mit wenigen Zeilen p5.js entstand eine Kugel aus Würfeln, die sich per Maus frei drehen lässt — der erste Versuch, Grundform und Wiederholung räumlich erlebbar zu machen.",
      visual: <PrototypePreview active={visible} />,
    },
    {
      number: "02",
      eyebrow: "Animation",
      title: "Bewegung wird organisch",
      text: "Aus dem statischen Prototyp wurde ein bewegtes System. Durch Rotation, Drift und Pulsieren sollte das Muster lebendiger wirken — nicht mechanisch, sondern fast organisch, als würde es sich von selbst weiterentwickeln.",
      visual: <AnimationPreview video="/Orbit-Rotate.mp4" />,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 88px;
          width: 100%;
          max-width: 1100px;
        }

        @media (max-width: 860px) {
          .progress-row {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            gap: 28px !important;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          width: "100%",
          padding: "96px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "72px",
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
            Fortschritt
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
              textShadow:
                "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
            }}
          >
            Vom Prototyp zur Animation
          </h2>

          <div
            style={{
              width: "80px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,210,255,0.9), transparent)",
              boxShadow: "0 0 8px rgba(0,210,255,0.7)",
            }}
          />
        </div>

        {/* Steps */}
        <div className="progress-steps">
          {steps.map((step, i) => (
            <StepRow
              key={step.number}
              step={step}
              reverse={i % 2 === 1}
              visible={visible}
            />
          ))}
        </div>
      </section>
    </>
  );
}
