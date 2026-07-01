import { useState } from "react";

interface ProjectCard {
  title: string;
  paragraphs: string[];
  tag: string;
  video?: string;
}

const projects: ProjectCard[] = [
  {
    title: "Pulsar Orbit",
    paragraphs: [
      "Ein Muster aus einfachen Formen, das sich im Raum bewegt. Würfel, Kugeln und andere Grundformen ordnen sich in einem Raster an und verändern sich Schritt für Schritt: Sie drehen sich, driften spiralförmig oder pulsieren nach außen.",
      "Man kann das Muster mit der Maus drehen und mit dem Scrollrad hinein- oder herauszoomen.",
    ],
    tag: "Muster im Raum",
    video: "/OrbitPreview.mp4",
  },
];

function VideoPlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, rgba(0,180,255,0.06) 0%, rgba(0,0,0,0.6) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Subtle scan-line texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,210,255,0.025) 3px, rgba(0,210,255,0.025) 4px)",
          pointerEvents: "none",
        }}
      />
      {/* Play icon */}
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
    </div>
  );
}

function ShowcaseCard({ project }: { project: ProjectCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-target"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: "10px",
        overflow: "hidden",
        border: `1px solid ${hovered ? "rgba(0,210,255,0.35)" : "rgba(0,210,255,0.15)"}`,
        boxShadow: hovered
          ? "0 0 50px rgba(0,180,255,0.12), inset 0 0 30px rgba(0,180,255,0.04)"
          : "none",
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Video or placeholder */}
      {project.video ? (
        <video
          src={project.video}
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

      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "6px 12px",
          borderRadius: "999px",
          border: "1px solid rgba(0,210,255,0.3)",
          background: "rgba(0,10,20,0.55)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(0,210,255,0.9)",
            boxShadow: "0 0 8px rgba(0,210,255,0.9)",
          }}
        />
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {project.tag}
        </span>
      </div>
    </div>
  );
}

export default function About() {
  const project = projects[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          width: 100%;
          max-width: 1100px;
        }

        @media (max-width: 860px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>

      <section
        style={{
          width: "100%",
          padding: "96px 24px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="about-grid">
          {/* Text column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "20px",
              textAlign: "left",
            }}
          >
            {/* Eyebrow */}
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
              Über das Projekt
            </span>

            {/* Title */}
            <h2
              style={{
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 4.2vw, 3rem)",
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                WebkitTextStroke: "0.5px rgba(0,210,255,0.7)",
                textShadow:
                  "0 0 40px rgba(0,180,255,0.3), 0 6px 24px rgba(0,0,0,0.8)",
              }}
            >
              {project.title}
            </h2>

            {/* Paragraphs */}
            {project.paragraphs.map((text, i) => (
              <p
                key={i}
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
                {text}
              </p>
            ))}
          </div>

          {/* Visual column */}
          <ShowcaseCard project={project} />
        </div>
      </section>
    </>
  );
}
