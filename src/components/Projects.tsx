import { useState } from "react";
import { Link } from "react-router-dom";

interface ProjectCard {
  title: string;
  description: string;
  link: string;
  tag: string;
  video?: string;
}

const projects: ProjectCard[] = [
  {
    title: "Pulsar Orbit",
    description:
      "Dieses Projekt ist ein interaktives 3D-Muster im Raum. Es besteht aus vielen kleinen, leuchtenden Quadraten, die zusammen eine geometrische Form bilden.",
    link: "/design-pattern",
    tag: "Muster im Raum",
    video: "/OrbitPreview.mp4",
  },
  {
    title: "Orbit Dynamics",
    description:
      "Dieses Projekt visualisiert ein interaktives Motion-Design-System aus orbitalen Bewegungen, geometrischer Balance und kinetischer Animation. Dynamische Elemente reagieren in Echtzeit und erzeugen einen futuristischen visuellen Flow zwischen Rotation, Rhythmus und digitaler Ästhetik.",
    link: "/fullscreen-video",
    tag: "Motion Design",
    video: "/Motion.mp4",
  },
];

function VideoPlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background:
          "linear-gradient(135deg, rgba(0,180,255,0.06) 0%, rgba(0,0,0,0.6) 100%)",
        border: "1px solid rgba(0,210,255,0.15)",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
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
      {/* Corner accents */}
      {[
        { top: 8, left: 8, borderTop: true, borderLeft: true },
        { top: 8, right: 8, borderTop: true, borderRight: true },
        { bottom: 8, left: 8, borderBottom: true, borderLeft: true },
        { bottom: 8, right: 8, borderBottom: true, borderRight: true },
      ].map((corner, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: corner.top,
            left: corner.left,
            bottom: corner.bottom,
            right: corner.right,
            width: 12,
            height: 12,
            borderTop: corner.borderTop
              ? "1px solid rgba(0,210,255,0.55)"
              : undefined,
            borderLeft: corner.borderLeft
              ? "1px solid rgba(0,210,255,0.55)"
              : undefined,
            borderBottom: corner.borderBottom
              ? "1px solid rgba(0,210,255,0.55)"
              : undefined,
            borderRight: corner.borderRight
              ? "1px solid rgba(0,210,255,0.55)"
              : undefined,
          }}
        />
      ))}
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

function Card({ project, index }: { project: ProjectCard; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        background: hovered
          ? "rgba(0,180,255,0.055)"
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? "rgba(0,210,255,0.35)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "10px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        transition:
          "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
        boxShadow: hovered
          ? "0 0 40px rgba(0,180,255,0.1), inset 0 0 30px rgba(0,180,255,0.03)"
          : "none",
        cursor: "default",
        animationDelay: `${index * 120}ms`,
      }}
    >
      {/* Tag */}
      <span
        style={{
          display: "inline-block",
          alignSelf: "flex-start",
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(0,210,255,0.8)",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          border: "1px solid rgba(0,210,255,0.25)",
          borderRadius: "3px",
          padding: "3px 10px",
          background: "rgba(0,210,255,0.05)",
        }}
      >
        {project.tag}
      </span>

      {/* Video or placeholder */}
      {project.video ? (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid rgba(0,210,255,0.15)",
          }}
        >
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
        </div>
      ) : (
        <VideoPlaceholder />
      )}

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
          color: "#fff",
          letterSpacing: "-0.01em",
          WebkitTextStroke: "0.3px rgba(0,210,255,0.5)",
          textShadow: "0 0 20px rgba(0,180,255,0.25)",
        }}
      >
        {project.title}
      </h3>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "clamp(0.78rem, 1.1vw, 0.88rem)",
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          letterSpacing: "0.01em",
          flexGrow: 1,
        }}
      >
        {project.description}
      </p>

      {/* Link */}
      <Link
        to={project.link}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          alignSelf: "flex-start",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.72rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: hovered ? "rgba(0,210,255,1)" : "rgba(0,210,255,0.7)",
          textDecoration: "none",
          transition: "color 0.3s ease",
          borderBottom: "1px solid rgba(0,210,255,0.25)",
          paddingBottom: "2px",
        }}
      >
        View Project
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 9L9 1M9 1H3M9 1V7"
            stroke="rgba(0,210,255,0.9)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

export default function Projects() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;700;800&display=swap');
      `}</style>

      <section
        style={{
          width: "100%",
          padding: "96px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "56px",
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
            Selected Work
          </span>

          {/* Title */}
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
            Projects
          </h2>

          {/* Divider */}
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

        {/* Cards grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
            maxWidth: "1024px",
          }}
        >
          {projects.map((project, i) => (
            <Card key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
