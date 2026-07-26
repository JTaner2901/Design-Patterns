import { useEffect, useState, type ReactNode } from "react";

export const DESKTOP_BREAKPOINT = 1024;

export function useIsDesktop(breakpoint: number = DESKTOP_BREAKPOINT) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : true,
  );

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isDesktop;
}

function DesktopHint() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "32px",
        textAlign: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');
      `}</style>

      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect
          x="6"
          y="10"
          width="44"
          height="28"
          rx="2"
          stroke="rgba(0,210,255,0.8)"
          strokeWidth="1.5"
        />
        <line
          x1="22"
          y1="44"
          x2="34"
          y2="44"
          stroke="rgba(0,210,255,0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="28"
          y1="38"
          x2="28"
          y2="44"
          stroke="rgba(0,210,255,0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.65rem",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(0,210,255,0.75)",
        }}
      >
        Nur am Desktop
      </span>

      <h1
        style={{
          margin: 0,
          maxWidth: "480px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.4rem, 5vw, 2rem)",
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          WebkitTextStroke: "0.4px rgba(0,210,255,0.6)",
          textShadow: "0 0 30px rgba(0,180,255,0.3)",
        }}
      >
        Bitte auf einem größeren Bildschirm öffnen
      </h1>

      <p
        style={{
          margin: 0,
          maxWidth: "420px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.7,
        }}
      >
        Pulsar Orbit nutzt 3D-Interaktion, ein Steuerungs-Panel und
        Maussteuerung, die auf kleinen Bildschirmen nicht optimal funktionieren.
        Am besten öffnest du die Seite an einem Laptop oder Desktop-Computer.
      </p>
    </div>
  );
}

export default function DesktopOnlyGate({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop(DESKTOP_BREAKPOINT);
  return isDesktop ? <>{children}</> : <DesktopHint />;
}
