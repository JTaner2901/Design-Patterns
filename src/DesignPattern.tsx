import { useEffect, useRef, useState } from "react";
import p5 from "p5";

// ============================================================
//  SETTINGS — alle Steuerparameter zentral hier anpassen
// ============================================================
const SETTINGS = {
  // --- Grid / Struktur ---
  zAngleStep: 30, // Winkelschritte auf Z-Achse (Grad) → mehr = weniger Ringe
  xAngleStep: 30, // Winkelschritte auf X-Achse (Grad) → mehr = weniger Boxen pro Ring
  radius: 120, // Kugelradius in absoluten Pixeln (unabhängig von Canvas-Größe)

  // --- Box-Größe ---
  boxSize: 18, // Kantenlänge der einzelnen Boxen (px)

  // --- Rotation ---
  autoRotateSpeed: 0.12, // Grad pro Frame bei Auto-Rotation
  autoRotate: true, // Auto-Rotation an/aus
  mouseRotateStrength: 0.004, // Wie stark die Mausbewegung rotiert

  // --- Zoom ---
  zoomSensitivity: 12, // Scroll-Zoom-Stärke (px pro Scroll-Event)
  zoomMin: 40, // Minimale Kameradistanz
  zoomMax: 40000, // Maximale Kameradistanz
  zoomDefault: 900, // Startzoom — sieht alles bei radius=120

  // --- Farben ---
  bgColor: [4, 8, 24], // Hintergrundfarbe (RGB) — tiefes Navy
  colorA: [0, 180, 255], // Gradient-Farbe A (Cyan)
  colorB: [20, 60, 220], // Gradient-Farbe B (Deep Blue)
  colorAccent: [120, 240, 255], // Akzentfarbe für Hover / Spitzen
  gradientSpeed: 0.005, // Wie schnell der Gradient pulsiert

  // --- Stil ---
  useFill: false, // true = Box mit Füllung, false = nur Outline
  strokeWeight: 1.2, // Linienstärke
  fillAlpha: 60, // Füll-Alpha wenn useFill = true (0–255)

  // --- Glow / Post-FX (simuliert via mehrere Lagen) ---
  glowLayers: 2, // Anzahl Glow-Kopien (0 = kein Glow, max 3)
  glowOffset: 0.8, // Größen-Offset pro Glow-Layer

  // --- Kamera ---
  fov: 60, // Kamera-Sichtfeld in Grad
  easing: 0.06, // Interpolations-Stärke für sanfte Rotations-Bewegung (0.01–0.15)
};
// ============================================================

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      // ----- Zustandsvariablen -----
      let rotX = 0; // aktuelle X-Rotation der Szene
      let rotY = 0; // aktuelle Y-Rotation der Szene
      let targetRotX = 0; // Ziel-X-Rotation (für Easing)
      let targetRotY = 0; // Ziel-Y-Rotation (für Easing)
      let autoRotOffset = 0; // akkumulierter Auto-Rotate-Winkel

      let camDist = SETTINGS.zoomDefault;
      let targetCamDist = SETTINGS.zoomDefault;

      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      // ----- Setup -----
      p.setup = () => {
        const w = containerRef.current?.offsetWidth  || 800;
        const h = containerRef.current?.offsetHeight || 500;

        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);

        const fov = (SETTINGS.fov * Math.PI) / 180;
        p.perspective(fov, w / h, 1, 200000);
      };

      p.draw = () => {
        // Hintergrund
        p.background(
          SETTINGS.bgColor[0],
          SETTINGS.bgColor[1],
          SETTINGS.bgColor[2],
        );

        // camera
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing);
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);

        // Auto-Rotation akkumulieren
        if (SETTINGS.autoRotate) {
          autoRotOffset += SETTINGS.autoRotateSpeed;
          targetRotY = autoRotOffset;
        }

        // Smooth Easing zur Zielrotation
        rotX = p.lerp(rotX, targetRotX, SETTINGS.easing);
        rotY = p.lerp(rotY, targetRotY, SETTINGS.easing);

        p.rotateX(rotX);
        p.rotateY(rotY);

        // Alle Boxen zeichnen
        drawBoxGrid();
      };

      // ----- Box-Gitter zeichnen -----
      function drawBoxGrid() {
        const t = p.frameCount * SETTINGS.gradientSpeed * 360; // Zeit-Parameter für Gradient

        for (let zAngle = 0; zAngle < 180; zAngle += SETTINGS.zAngleStep) {
          for (let xAngle = 0; xAngle < 360; xAngle += SETTINGS.xAngleStep) {
            // Gradient-Faktor: kombiniert Position + Zeit für dynamischen Look
            const gradT =
              ((zAngle / 180 + xAngle / 360) * 0.5 +
                Math.sin((t + zAngle + xAngle) * 0.01) * 0.5 +
                0.5) %
              1;

            const r = p.lerp(preset.b[0], preset.a[0], wave);
            const g = p.lerp(preset.b[1], preset.a[1], wave);
            const b = p.lerp(preset.b[2], preset.a[2], wave);

            for (let gl = SETTINGS.glowLayers; gl >= 0; gl--) {
              const isGlow = gl > 0;
              const glowSize =
                SETTINGS.boxSize +
                gl * SETTINGS.glowOffset * SETTINGS.boxSize * 0.25;
              const alpha = isGlow
                ? p.map(gl, 1, SETTINGS.glowLayers, 60, 15)
                : 255;

              p.push();
              p.rotateZ(zAngle);
              p.rotateX(xAngle);

              p.translate(0, SETTINGS.radius, 0);

              p.stroke(r, g, b, alpha);
              p.strokeWeight(
                isGlow ? SETTINGS.strokeWeight * 2 : SETTINGS.strokeWeight,
              );

              p.noFill();
              p.box(size);
              p.pop();
            }
          }
        }
      }

      // ----- Maus: Drag für Rotation -----
      p.mousePressed = () => {
        dragging = true;
        lastX = p.mouseX;
        lastY = p.mouseY;
      };

      p.mouseReleased = () => {
        dragging = false;
      };

      p.mouseDragged = () => {
        if (!isDragging) return;
        const dx = p.mouseX - lastMouseX;
        const dy = p.mouseY - lastMouseY;

        targetRotY += dx * SETTINGS.mouseRotateStrength * 60;
        targetRotX += dy * SETTINGS.mouseRotateStrength * 60;

        // X-Rotation begrenzen (nicht überschlagen)
        targetRotX = p.constrain(targetRotX, -70, 70);

        lastMouseX = p.mouseX;
        lastMouseY = p.mouseY;

        if (SETTINGS.autoRotate) autoRotOffset = targetRotY;
      };

      // ----- Mausbewegung (ohne Drag) beeinflusst subtil die Szene -----
      p.mouseMoved = () => {
        if (isDragging) return;
        // Sehr subtile parallax-artige Beeinflussung
        const nx = (p.mouseX / p.width - 0.5) * 2; // -1 bis +1
        const ny = (p.mouseY / p.height - 0.5) * 2; // -1 bis +1
        if (!SETTINGS.autoRotate) {
          targetRotY += nx * 0.08;
          targetRotX = p.constrain(ny * 20, -70, 70);
        }
      };

      // ----- Scroll für Zoom -----
      p.mouseWheel = (event: WheelEvent) => {
        targetCamDist += event.deltaY * SETTINGS.zoomSensitivity;
        targetCamDist = p.constrain(
          targetCamDist,
          SETTINGS.zoomMin,
          SETTINGS.zoomMax
        );
        return false;
      };

      p.windowResized = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        p.resizeCanvas(w, h);
        // Perspektive nach Resize neu berechnen
        const fovRad = (SETTINGS.fov * Math.PI) / 180;
        p.perspective(fovRad, w / h, 1, 8000);
      };
    };

    const instance = new p5(sketch, containerRef.current);
    return () => instance.remove();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* UI */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.08em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <span>DRAG · Rotate</span>
        <span>SCROLL · Zoom</span>
        <span>DBLCLICK · Toggle Auto</span>
      </div>
    </div>
  );
}