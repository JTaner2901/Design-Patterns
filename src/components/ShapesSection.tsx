import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Shapes + colors — taken 1:1 aus DesignPattern.tsx
   (COLOR_PRESETS: Blue, Purple, Red, Gold, White)
───────────────────────────────────────────── */

type ShapeKey = "box" | "sphere" | "cone" | "torus" | "cylinder" | "star";

interface ShapeDef {
  key: ShapeKey;
  label: string;
  color: string; // hex, aus dem Muster-Farbschema
}

const SHAPES: ShapeDef[] = [
  { key: "box", label: "Würfel", color: "#00b4ff" }, // Blue (a)
  { key: "sphere", label: "Kugel", color: "#b400ff" }, // Purple (a)
  { key: "cone", label: "Kegel", color: "#ff3c3c" }, // Red (a)
  { key: "torus", label: "Torus", color: "#ffc800" }, // Gold (a)
  { key: "cylinder", label: "Zylinder", color: "#ffffff" }, // White (a)
  { key: "star", label: "Stern", color: "#143cdc" }, // Blue (b)
];

function buildGeometry(key: ShapeKey): THREE.Object3D {
  switch (key) {
    case "box":
      return new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3));
    case "sphere":
      return new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32));
    case "cone":
      return new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.6, 6, 1, true));
    case "torus":
      return new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.28, 16, 48));
    case "cylinder":
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 1.6, 6, 1, true),
      );
    case "star": {
      const group = new THREE.Group();
      const armGeom = (sx: number, sy: number, sz: number) =>
        new THREE.BoxGeometry(sx, sy, sz);
      const arms = [
        armGeom(1.7, 0.3, 0.3),
        armGeom(0.3, 1.7, 0.3),
        armGeom(0.3, 0.3, 1.7),
      ];
      arms.forEach((g) => group.add(new THREE.Mesh(g)));
      return group;
    }
  }
}

/* ─────────────────────────────────────────────
   Mini Live Preview — eigene, leichte three.js Szene
   pro Karte. Zeigt nur die Form, sonst nichts.
───────────────────────────────────────────── */

function ShapePreview({
  shapeKey,
  color,
}: {
  shapeKey: ShapeKey;
  color: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 4.4);

    const colorObj = new THREE.Color(color);

    // ── Nur Stroke, kein Fill, kein Licht — wie in DesignPattern.tsx
    // (p.noFill() + p.stroke(r,g,b,alpha), kein Lighting-Call) ──
    const wrapper = new THREE.Group();
    const rawObject = buildGeometry(shapeKey);

    rawObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geo = child.geometry;
        // Kugel/Torus bekommen ein volles Gitter-Wireframe.
        // Box/Stern/Zylinder/Kegel sind kantig (niedrige Segmentzahl,
        // wie im Original) und bekommen darum klare Kanten.
        const isFlatEdged =
          shapeKey === "box" ||
          shapeKey === "star" ||
          shapeKey === "cylinder" ||
          shapeKey === "cone";
        const lineGeo = isFlatEdged
          ? new THREE.EdgesGeometry(geo)
          : new THREE.WireframeGeometry(geo);

        const line = new THREE.LineSegments(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: colorObj,
            transparent: true,
            opacity: 0.9,
          }),
        );
        wrapper.add(line);
      }
    });

    wrapper.rotation.x = 0.5;
    wrapper.rotation.y = 0.6;
    scene.add(wrapper);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    // Glow-Effekt anstelle der glowLayers aus DesignPattern.tsx
    renderer.domElement.style.filter = `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 2px ${color})`;
    container.appendChild(renderer.domElement);

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const speed = 0.28 + Math.random() * 0.15;
    let raf: number;
    const clock = new THREE.Clock();

    const loop = () => {
      const dt = clock.getDelta();
      wrapper.rotation.y += dt * speed;
      wrapper.rotation.x += dt * speed * 0.25;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrapper.traverse((child) => {
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      rawObject.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [shapeKey, color]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

/* ─────────────────────────────────────────────
   Card
───────────────────────────────────────────── */

function ShapeCard({
  shape,
  index,
  visible,
}: {
  shape: ShapeDef;
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-target"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "24px",
        borderRadius: "10px",
        background: hovered ? `${shape.color}0d` : "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? `${shape.color}59` : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? `0 0 40px ${shape.color}26` : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(28px)",
        transition:
          "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, " +
          `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms, ` +
          `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms`,
        overflow: "hidden",
      }}
    >
      {/* Glow im Hintergrund, in der Farbe der Form */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 40%, ${shape.color}22 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{ width: "100%", aspectRatio: "1 / 1", position: "relative" }}
      >
        {visible && <ShapePreview shapeKey={shape.key} color={shape.color} />}
      </div>

      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
          fontSize: "0.72rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: hovered ? "#fff" : "rgba(255,255,255,0.7)",
          transition: "color 0.3s ease",
        }}
      >
        {shape.label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */

export default function ShapesSection() {
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

        .shapes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 1024px;
        }

        @media (max-width: 760px) {
          .shapes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .shapes-grid {
            grid-template-columns: 1fr;
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
            Bausteine
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
            Die Grundformen
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

        {/* Cards */}
        <div className="shapes-grid">
          {SHAPES.map((shape, i) => (
            <ShapeCard
              key={shape.key}
              shape={shape}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </section>
    </>
  );
}
