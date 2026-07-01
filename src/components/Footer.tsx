import { useState } from "react";

/* ─────────────────────────────────────────────
   Footer — Projekt-/Semesterangaben
   Quelle: Semesterplan "Design Pattern", SoSe 2026
───────────────────────────────────────────── */

function BackToTop() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-target"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 300,
        fontSize: "0.7rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: hovered ? "rgba(0,210,255,1)" : "rgba(255,255,255,0.5)",
        transition: "color 0.3s ease",
      }}
    >
      Nach oben
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ transform: "rotate(-90deg)" }}
      >
        <path
          d="M1 9L9 1M9 1H3M9 1V7"
          stroke={hovered ? "rgba(0,210,255,1)" : "rgba(255,255,255,0.5)"}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        .footer-columns {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          width: 100%;
          max-width: 1024px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 200px;
        }

        .footer-link {
          color: rgba(0,210,255,0.75);
          text-decoration: none;
          border-bottom: 1px solid rgba(0,210,255,0.25);
          transition: color 0.3s ease, border-color 0.3s ease;
          width: fit-content;
        }
        .footer-link:hover {
          color: rgba(0,210,255,1);
          border-color: rgba(0,210,255,0.6);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          width: 100%;
          max-width: 1024px;
        }

        @media (max-width: 640px) {
          .footer-columns {
            flex-direction: column;
            gap: 28px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <footer
        style={{
          width: "100%",
          padding: "56px 24px 40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {/* Divider */}
        <div
          style={{
            width: "100%",
            maxWidth: "1024px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,210,255,0.25), transparent)",
          }}
        />

        {/* Columns */}
        <div className="footer-columns">
          <div className="footer-col">
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#fff",
              }}
            >
              Juan-Taner Allerborn
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              SoSe 2026
            </span>
          </div>

          <div className="footer-col">
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#fff",
              }}
            >
              Design Pattern
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              bei Prof. Andreas Teufel &amp; Leonard Rokita
            </span>
          </div>

          <div className="footer-col">
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#fff",
              }}
            >
              Hochschule Bremen
            </span>
            <a
              href="https://www.hs-bremen.de/studieren/studiengang/internationaler-studiengang-medieninformatik-b-sc/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link cursor-target"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 300,
                fontSize: "0.75rem",
              }}
            >
              Internationaler Studiengang Medieninformatik B.Sc.
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom">
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Pulsar Orbit
          </span>

          <BackToTop />
        </div>
      </footer>
    </>
  );
}
