import ColorBends from "./components/ColorBends";
import SplitText from "./components/SplitText";
import About from "./components/About";
import { useState } from "react";
import ShapesSection from "./components/ShapesSection";
import Progresssection from "./components/Progresssection";
import DesignPattern from "./DesignPattern";
import TechStackSection from "./components/Techstacksection";
import Targetcursor from "./components/Targetcursor";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function MainPage() {
  const [showSubtitle, setShowSubtitle] = useState(false);

  return (
    <>
      <Targetcursor />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          background: #000;
        }

        .headline-text {
          -webkit-text-stroke: 0.5px rgba(0, 210, 255, 0.7);
          paint-order: stroke fill;
        }
      `}</style>

      {/* Scrollbarer Seiten-Wrapper */}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          background: "#000",
          overflowX: "hidden",
        }}
      >
        {/* ─── HERO SECTION ─── */}
        <section
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Hintergrund — bleibt im Hero eingesperrt */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <ColorBends
              colors={["#00b4ff"]}
              rotation={90}
              speed={0.2}
              scale={0.6}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              noise={0.15}
              parallax={0.5}
              iterations={1}
              intensity={1.5}
              bandWidth={6}
              transparent
              autoRotate={0}
            />
          </div>

          {/* Text-Content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              textAlign: "center",
              userSelect: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
                width: "100%",
                maxWidth: "1024px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  padding: 0,
                  width: "100%",
                  lineHeight: 1.15,
                  display: "block",
                  textAlign: "center",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <SplitText
                  text="Every shape has a soul."
                  className="headline-text text-5xl sm:text-6xl md:text-8xl text-white antialiased"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    WebkitTextStroke: "0.5px rgba(0, 210, 255, 0.7)",
                    textShadow:
                      "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
                  }}
                  delay={60}
                  duration={1.2}
                  ease="power3.out"
                  splitType="chars"
                  threshold={0}
                  rootMargin="0px"
                  textAlign="center"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  onLetterAnimationComplete={() => setShowSubtitle(true)}
                />
              </h1>

              {/* Divider */}
              <div
                style={{
                  width: showSubtitle ? "80px" : "0px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,210,255,0.9), transparent)",
                  transition: "width 1s ease-out",
                  boxShadow: "0 0 8px rgba(0,210,255,0.7)",
                }}
              />

              {/* Subtext */}
              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(0.75rem, 1.2vw, 0.95rem)",
                  color: "rgba(255,255,255,0.92)",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 300,
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                  transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
                  opacity: showSubtitle ? 1 : 0,
                  transform: showSubtitle
                    ? "translateY(0px)"
                    : "translateY(14px)",
                  textShadow:
                    "0 0 20px rgba(0,180,255,0.5), 0 2px 8px rgba(0,0,0,1)",
                }}
              >
                Drag it. Spin it. Watch it breathe.
              </p>
            </div>
          </div>

          {/* Scroll-Hint Arrow */}
          {showSubtitle && (
            <div
              style={{
                position: "absolute",
                bottom: "32px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                animation: "scrollBounce 2s ease-in-out infinite",
                opacity: 0.5,
              }}
            >
              <style>{`
                @keyframes scrollBounce {
                  0%, 100% { transform: translateX(-50%) translateY(0px); }
                  50% { transform: translateX(-50%) translateY(8px); }
                }
              `}</style>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 6L9 12L15 6"
                  stroke="rgba(0,210,255,0.8)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </section>

        {/* ─── ABOUT SECTION ─── */}
        <About />

        {/* ─── SHAPES SECTION ─── */}
        <ShapesSection />

        {/* ─── PROGRESS SECTION ─── */}
        <Progresssection />

        {/* ─── TECH STACK SECTION ─── */}
        <TechStackSection />

        {/* ─── CTA SECTION ─── */}
        <CTASection />

        {/* ─── FOOTER SECTION ─── */}
        <Footer />
      </div>
    </>
  );
}
