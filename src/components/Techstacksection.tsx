import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Daten — verifiziert gegen DesignPattern.tsx:
   - 6 Formen: SHAPE_KEYS_DETERMINISTIC (box, sphere,
     cone, torus, cylinder, star)
   - 6 Muster-Modi: organicMode, morphMode, randomShapes,
     autoRotate, spiralDrift, explodePulse
   - Echtzeit: requestAnimationFrame-basiert, kein
     Video, keine Vorberechnung
───────────────────────────────────────────── */

const STATS = [
  { value: "6", label: "Formen" },
  { value: "6", label: "Muster-Modi" },
  { value: "5", label: "Farbvarianten" },
  { value: "800", label: "Elemente max." },
  { value: "3", label: "Glow-Ebenen" },
  { value: "Echtzeit", label: "Im Browser gerendert" },
];

const BADGES = ["p5.js", "WebGL", "React", "three.js", "GSAP"];

function StatValue({
  value,
  visible,
  delay,
}: {
  value: string;
  visible: boolean;
  delay: number;
}) {
  const numeric = /^\d+$/.test(value) ? parseInt(value, 10) : null;
  const [display, setDisplay] = useState(numeric !== null ? 0 : value);

  useEffect(() => {
    if (!visible || numeric === null) return;
    let raf: number;
    let start: number | null = null;
    const duration = 900;

    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        setDisplay(Math.round(eased * numeric));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [visible, numeric, delay]);

  return <>{display}</>;
}

export default function TechStackSection() {
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        .stat-row {
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
          width: 100%;
          max-width: 900px;
        }

        .badge-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          max-width: 700px;
        }

        @media (max-width: 760px) {
          .stat-row {
            gap: 32px 40px;
          }
        }

        @media (max-width: 560px) {
          .stat-row {
            gap: 28px 36px;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          width: "100%",
          padding: "72px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
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
            Technik
          </span>

          <h2
            style={{
              margin: 0,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              WebkitTextStroke: "0.5px rgba(0,210,255,0.7)",
              textShadow:
                "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
            }}
          >
            Unter der Haube
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
            Alles läuft live im Browser — kein vorgerendertes Video, keine
            Vorberechnung. Jede Bewegung wird in dem Moment berechnet, in dem
            sie zu sehen ist.
          </p>

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

        {/* Stats */}
        <div className="stat-row">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(20px)",
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  WebkitTextStroke: "0.5px rgba(0,210,255,0.7)",
                  textShadow: "0 0 30px rgba(0,180,255,0.35)",
                  lineHeight: 1,
                }}
              >
                <StatValue
                  value={stat.value}
                  visible={visible}
                  delay={i * 110 + 150}
                />
              </span>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.68rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="badge-row">
          {BADGES.map((badge, i) => (
            <span
              key={badge}
              className="cursor-target"
              style={{
                display: "inline-block",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(0,210,255,0.85)",
                border: "1px solid rgba(0,210,255,0.25)",
                borderRadius: "999px",
                padding: "8px 18px",
                background: "rgba(0,210,255,0.05)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(16px)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${300 + i * 80}ms, background 0.3s ease, border-color 0.3s ease`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,210,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(0,210,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,210,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(0,210,255,0.25)";
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
