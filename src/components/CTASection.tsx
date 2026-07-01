import { Link } from "react-router-dom";
import CubesBackground from "./CubesBackground";

/* ─────────────────────────────────────────────
   CTASection — der Schlusspunkt der Seite.
   Führt tatsächlich zum Projekt (/design-pattern).
   Cube-Grid im Hintergrund, passend zum Muster selbst.
───────────────────────────────────────────── */

export default function CTASection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        .cta-button {
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .cta-button:hover {
          border-color: rgba(0,210,255,0.9);
          box-shadow: 0 0 50px rgba(0,180,255,0.35);
          transform: translateY(-2px);
          background: rgba(0,210,255,0.1);
        }
      `}</style>

      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "70vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "96px 24px",
          boxSizing: "border-box",
        }}
      >
        <CubesBackground />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            textAlign: "center",
            maxWidth: "640px",
            pointerEvents: "none",
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
            Bereit?
          </span>

          <h2
            style={{
              margin: 0,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              WebkitTextStroke: "0.5px rgba(0,210,255,0.7)",
              textShadow:
                "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
            }}
          >
            Betritt das Muster
          </h2>

          <p
            style={{
              margin: 0,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.8,
              maxWidth: "480px",
            }}
          >
            Alles, was du bis hierhin gesehen hast, lässt sich jetzt live im
            Browser erleben. Drehen, zoomen, Formen wechseln, Farben ändern —
            das komplette Muster wartet auf dich.
          </p>

          <Link
            to="/design-pattern"
            className="cursor-target cta-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "12px",
              padding: "16px 36px",
              borderRadius: "999px",
              border: "1px solid rgba(0,210,255,0.4)",
              background: "rgba(0,210,255,0.05)",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              pointerEvents: "auto",
            }}
          >
            Zum Projekt
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 13L13 1M13 1H4M13 1V10"
                stroke="rgba(0,210,255,1)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.3)",
              marginTop: "4px",
            }}
          >
            öffnet im Vollbild
          </span>
        </div>
      </section>
    </>
  );
}
