// npm install p5 @types/p5
import { useEffect, useRef } from "react";
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

      let camDist = SETTINGS.zoomDefault; // aktueller Zoom
      let targetCamDist = SETTINGS.zoomDefault; // Ziel-Zoom (für Easing)

      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      // ----- Setup -----
      p.setup = () => {
        const w = containerRef.current?.offsetWidth || 800;
        const h = containerRef.current?.offsetHeight || 500;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
        p.colorMode(p.RGB, 255);

        // Perspektive setzen
        const fovRad = (SETTINGS.fov * Math.PI) / 180;
        p.perspective(fovRad, w / h, 1, 200000);
      };

      // ----- Haupt-Render-Loop -----
      p.draw = () => {
        // Hintergrund
        p.background(
          SETTINGS.bgColor[0],
          SETTINGS.bgColor[1],
          SETTINGS.bgColor[2],
        );

        // Kameradistanz smooth interpolieren
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing * 2);

        // Kamera positionieren (bewegt sich auf Z-Achse)
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);

        // Auto-Rotation akkumulieren
        if (SETTINGS.autoRotate) {
          autoRotOffset += SETTINGS.autoRotateSpeed;
          targetRotY = autoRotOffset;
        }

        // Smooth Easing zur Zielrotation
        rotX = p.lerp(rotX, targetRotX, SETTINGS.easing);
        rotY = p.lerp(rotY, targetRotY, SETTINGS.easing);

        // Globale Szenenrotation
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

            // Farbe zwischen colorA und colorB interpolieren
            const r = p.lerp(SETTINGS.colorB[0], SETTINGS.colorA[0], gradT);
            const g = p.lerp(SETTINGS.colorB[1], SETTINGS.colorA[1], gradT);
            const b = p.lerp(SETTINGS.colorB[2], SETTINGS.colorA[2], gradT);

            // Glow: mehrere halbtransparente, leicht größere Kopien
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

              // Stroke setzen
              p.stroke(r, g, b, alpha);
              p.strokeWeight(
                isGlow ? SETTINGS.strokeWeight * 2 : SETTINGS.strokeWeight,
              );

              // Fill setzen
              if (SETTINGS.useFill && !isGlow) {
                p.fill(r, g, b, SETTINGS.fillAlpha);
              } else {
                p.noFill();
              }

              p.box(glowSize);
              p.pop();
            }
          }
        }
      }

      // ----- Maus: Drag für Rotation -----
      p.mousePressed = () => {
        // Nur starten wenn Maus über Canvas ist
        if (
          p.mouseX > 0 &&
          p.mouseX < p.width &&
          p.mouseY > 0 &&
          p.mouseY < p.height
        ) {
          isDragging = true;
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
          // Auto-Rotate pausieren beim Drag
          if (SETTINGS.autoRotate) autoRotOffset = rotY;
        }
      };

      p.mouseReleased = () => {
        isDragging = false;
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
          SETTINGS.zoomMax,
        );
        return false; // Seiten-Scroll verhindern
      };

      // ----- Doppelklick: Auto-Rotate togglen -----
      p.doubleClicked = () => {
        SETTINGS.autoRotate = !SETTINGS.autoRotate;
        if (SETTINGS.autoRotate) autoRotOffset = rotY;
      };

      // ----- Resize -----
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

    const p5Instance = new p5(sketch, containerRef.current);
    return () => p5Instance.remove();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Canvas-Container */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />

      {/* UI-Overlay: Steuerhinweise */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "20px",
          color: "rgba(100, 210, 255, 0.55)",
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
