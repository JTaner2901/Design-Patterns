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

/* ─────────────────────────────────────────────
   Gemeinsamer Formen-Helper für die Mini-Previews
   unten — vereinfachte Version von shapeRegistry
   aus DesignPattern.tsx.
───────────────────────────────────────────── */

const MINI_SHAPES = [
  "box",
  "sphere",
  "cone",
  "torus",
  "cylinder",
  "star",
] as const;
type MiniShape = (typeof MINI_SHAPES)[number];

function drawMiniShape(p: p5, key: MiniShape, size: number) {
  switch (key) {
    case "box":
      p.box(size);
      break;
    case "sphere": {
      const r = size * 0.6;
      p.beginShape();
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        p.vertex(Math.cos(a) * r, Math.sin(a) * r, 0);
      }
      p.endShape(p.CLOSE);
      break;
    }
    case "cone":
      p.cone(size * 0.5, size * 1.3, 6, 1, false);
      break;
    case "torus":
      p.torus(size * 0.45, size * 0.14, 8, 5);
      break;
    case "cylinder":
      p.cylinder(size * 0.38, size * 1.1, 6, 1, false, false);
      break;
    case "star":
      p.push();
      p.box(size, size * 0.3, size * 0.3);
      p.pop();
      p.push();
      p.rotateX(60);
      p.box(size * 0.3, size, size * 0.3);
      p.pop();
      p.push();
      p.rotateZ(60);
      p.box(size * 0.3, size * 0.3, size);
      p.pop();
      break;
  }
}

/** Einheitliche Karten-Hülle für alle Mini-Previews (Cyan-Theme, wie das echte Muster) */
function MiniPreviewCard({ children }: { children: React.ReactNode }) {
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
        background: "#000",
      }}
    >
      {children}
    </div>
  );
}

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
   Step 2 — Vielfalt: kleines Raster aus gemischten
   Formen, mischt sich alle paar Sekunden neu.
───────────────────────────────────────────── */

function MixedShapesPreview({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;

    const sketch = (p: p5) => {
      const rows = 4;
      const cols = 8;
      let grid: MiniShape[][] = [];
      let lastShuffle = 0;
      let rot = 0;

      const shuffle = () => {
        grid = Array.from({ length: rows }, () =>
          Array.from(
            { length: cols },
            () => MINI_SHAPES[Math.floor(Math.random() * MINI_SHAPES.length)],
          ),
        );
      };

      p.setup = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
        shuffle();
      };

      p.draw = () => {
        p.background(0);
        if (p.millis() - lastShuffle > 3500) {
          shuffle();
          lastShuffle = p.millis();
        }
        const t = p.frameCount * 0.03;
        rot += 0.15;
        p.rotateY(rot);
        p.rotateX(18);

        const spacing = 26;
        const offX = -((cols - 1) * spacing) / 2;
        const offY = -((rows - 1) * spacing) / 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wave =
              ((r / rows + c / cols) * 0.5 +
                Math.sin((t + r + c) * 0.6) * 0.5 +
                0.5) %
              1;
            const pulse = 11 * (1 + 0.15 * Math.sin(t * 3 + r + c));
            p.push();
            p.translate(offX + c * spacing, offY + r * spacing, 0);
            p.noFill();
            p.stroke(
              p.lerp(20, 0, wave),
              p.lerp(60, 180, wave),
              p.lerp(220, 255, wave),
              220,
            );
            p.strokeWeight(1.2);
            drawMiniShape(p, grid[r][c], pulse);
            p.pop();
          }
        }
      };

      p.windowResized = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.resizeCanvas(w, h);
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, [active]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

/* ─────────────────────────────────────────────
   Step 4 — Neue Räume: dieselben Zellen wechseln
   automatisch zwischen Sphere / Flat / Fibonacci /
   Helix, sanft ineinander übergehend (Lerp).
───────────────────────────────────────────── */

type Vec3 = [number, number, number];

function DistributionPreview({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;

    const sketch = (p: p5) => {
      const rows = 6;
      const cols = 10;
      const total = rows * cols;
      const radius = 90;

      const sphereT: Vec3[] = [];
      const flatT: Vec3[] = [];
      const fiboT: Vec3[] = [];
      const helixT: Vec3[] = [];

      const zStep = 180 / rows;
      const xStep = 360 / cols;
      let idx = 0;
      for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
          const z = ri * zStep;
          const x = ci * xStep;

          const latRad = (z * Math.PI) / 180;
          const lonRad = (x * Math.PI) / 180;
          sphereT.push([
            radius * Math.sin(latRad) * Math.cos(lonRad),
            radius * Math.cos(latRad),
            radius * Math.sin(latRad) * Math.sin(lonRad),
          ]);

          const flatSpacing = (radius / Math.max(rows, cols)) * 2.4;
          const flatW = (cols - 1) * flatSpacing;
          const flatH = (rows - 1) * flatSpacing;
          flatT.push([
            ci * flatSpacing - flatW / 2,
            ri * flatSpacing - flatH / 2,
            0,
          ]);

          const goldenAngle = Math.PI * (3 - Math.sqrt(5));
          const fy = 1 - (idx / Math.max(total - 1, 1)) * 2;
          const radAtY = Math.sqrt(Math.max(0, 1 - fy * fy));
          const theta = goldenAngle * idx;
          fiboT.push([
            Math.cos(theta) * radAtY * radius,
            fy * radius,
            Math.sin(theta) * radAtY * radius,
          ]);

          const totalPairs = Math.max(Math.ceil(total / 2), 1);
          const pairIndex = Math.floor(idx / 2);
          const strand = idx % 2;
          const turns = 3;
          const twist =
            (pairIndex / Math.max(totalPairs - 1, 1)) * turns * Math.PI * 2;
          const helixAngle = twist + strand * Math.PI;
          const helixRadius = radius * 0.35;
          const helixHeight = radius * 2.2;
          const hy =
            (pairIndex / Math.max(totalPairs - 1, 1)) * helixHeight -
            helixHeight / 2;
          helixT.push([
            Math.cos(helixAngle) * helixRadius,
            hy,
            Math.sin(helixAngle) * helixRadius,
          ]);

          idx++;
        }
      }

      const targets = [sphereT, flatT, fiboT, helixT];
      let modeIndex = 0;
      let lastSwitch = 0;
      const current: Vec3[] = sphereT.map((v) => [...v] as Vec3);

      p.setup = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
      };

      let rot = 0;

      p.draw = () => {
        p.background(0);
        if (p.millis() - lastSwitch > 3500) {
          modeIndex = (modeIndex + 1) % targets.length;
          lastSwitch = p.millis();
        }
        const target = targets[modeIndex];
        rot += 0.25;
        p.rotateY(rot);
        p.rotateX(20);
        p.noFill();

        for (let i = 0; i < total; i++) {
          current[i][0] = p.lerp(current[i][0], target[i][0], 0.045);
          current[i][1] = p.lerp(current[i][1], target[i][1], 0.045);
          current[i][2] = p.lerp(current[i][2], target[i][2], 0.045);
          const wave =
            (i / total + Math.sin(p.frameCount * 0.02 + i) * 0.2 + 1) % 1;
          p.push();
          p.translate(
            current[i][0] * 0.55,
            current[i][1] * 0.55,
            current[i][2] * 0.55,
          );
          p.stroke(
            p.lerp(20, 0, wave),
            p.lerp(60, 180, wave),
            p.lerp(220, 255, wave),
            220,
          );
          p.strokeWeight(1.2);
          p.box(9);
          p.pop();
        }
      };

      p.windowResized = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.resizeCanvas(w, h);
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, [active]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

/* ─────────────────────────────────────────────
   Step 5 — Interaktion: endlos loopende Mini-
   Version der Cutscene (wächst, explodiert,
   resettet) — läuft von selbst, kein Klick nötig.
───────────────────────────────────────────── */

function CutscenePreview({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;

    const sketch = (p: p5) => {
      const radius = 90;

      p.setup = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
      };

      p.draw = () => {
        p.background(0);
        const cycle = 8000;
        const tCycle = (p.millis() % cycle) / cycle;

        let rows: number, cols: number, explode: number;
        if (tCycle < 0.5) {
          const g = tCycle / 0.5;
          rows = Math.round(p.lerp(2, 8, g));
          cols = Math.round(p.lerp(4, 16, g));
          explode = 1;
        } else if (tCycle < 0.7) {
          rows = 8;
          cols = 16;
          const b = (tCycle - 0.5) / 0.2;
          explode = 1 + Math.sin(b * Math.PI) * 1.8;
        } else {
          rows = 8;
          cols = 16;
          explode = 1;
        }

        const rot = p.frameCount * 0.6;
        p.rotateY(rot);
        p.rotateX(15);

        const zStep = 180 / rows;
        const xStep = 360 / cols;
        const t = p.frameCount * 0.02;

        for (let z = 0; z < 180; z += zStep) {
          for (let x = 0; x < 360; x += xStep) {
            const wave =
              ((z / 180 + x / 360) * 0.5 +
                Math.sin((t + z + x) * 0.05) * 0.5 +
                0.5) %
              1;
            p.push();
            p.rotateZ(z);
            p.rotateX(x);
            p.translate(0, radius * explode, 0);
            p.noFill();
            p.stroke(
              p.lerp(20, 0, wave),
              p.lerp(60, 180, wave),
              p.lerp(220, 255, wave),
              220,
            );
            p.strokeWeight(1.1);
            p.box(9);
            p.pop();
          }
        }
      };

      p.windowResized = () => {
        const w = container.clientWidth || BASE_W;
        const h = (w * BASE_H) / BASE_W;
        p.resizeCanvas(w, h);
      };
    };

    const instance = new p5(sketch, container);
    return () => instance.remove();
  }, [active]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
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

function MediaPreview({ video }: { video?: string }) {
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
      eyebrow: "Vielfalt",
      title: "Formen werden vielfältig",
      text: "Aus der einen Form wurden mehrere: Würfel, Kugel, Kegel, Torus, Zylinder und Stern lassen sich jetzt frei auswählen. Dazu kam ein Morph-Modus, der beim Formwechsel sanft zwischen zwei Formen überblendet, und ein Mixed-Modus, der mehrere Formen zufällig im Muster verteilt.",
      visual: (
        <MiniPreviewCard>
          <MixedShapesPreview active={visible} />
        </MiniPreviewCard>
      ),
    },
    {
      number: "03",
      eyebrow: "Animation",
      title: "Bewegung wird organisch",
      text: "Aus dem statischen Prototyp wurde ein bewegtes System. Durch Rotation, Drift und Pulsieren sollte das Muster lebendiger wirken — nicht mechanisch, sondern fast organisch, als würde es sich von selbst weiterentwickeln.",
      visual: <MediaPreview video="/Orbit-Rotate.mp4" />,
    },
    {
      number: "04",
      eyebrow: "Neue Räume",
      title: "Neue Räume entstehen",
      text: "Bisher stand jede Form fest auf einer Kugeloberfläche. Jetzt lässt sich auch die Verteilung selbst verändern: als flaches Raster, als Fibonacci-Spirale nach dem goldenen Winkel, oder als Doppelhelix. Aus einem festen Aufbau wurde ein Raum mit mehreren möglichen Formen.",
      visual: (
        <MiniPreviewCard>
          <DistributionPreview active={visible} />
        </MiniPreviewCard>
      ),
    },
    {
      number: "05",
      eyebrow: "Interaktion",
      title: "Das Muster erzählt sich selbst",
      text: "Zum Schluss sollte sich das Muster auch von selbst zeigen können. Ein Knopfdruck startet eine automatische Sequenz: vom kleinsten Zustand bis zum großen Finale, mit eigenem, im Code erzeugtem Sound — eine kleine Geschichte, die das ganze Muster in wenigen Sekunden erzählt.",
      visual: (
        <MiniPreviewCard>
          <CutscenePreview active={visible} />
        </MiniPreviewCard>
      ),
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
            Der Weg zum fertigen Muster
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
