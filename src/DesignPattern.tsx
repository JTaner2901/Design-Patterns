import { useEffect, useRef, useState } from "react";
import p5 from "p5";

type UISettings = {
  rows: number;
  cols: number;
  colorIndex: number;
};

const COLOR_PRESETS = [
  { name: "Blue", a: [0, 180, 255], b: [20, 60, 220] },
  { name: "Purple", a: [180, 0, 255], b: [80, 0, 180] },
  { name: "Red", a: [255, 60, 60], b: [120, 0, 0] },
  { name: "Gold", a: [255, 200, 0], b: [180, 120, 0] },
  { name: "White", a: [255, 255, 255], b: [180, 180, 180] },
];

const SETTINGS = {
  radius: 120,
  boxSize: 18,
  strokeWeight: 1.2,
  glowLayers: 2,
  glowOffset: 0.8,

  zoomSensitivity: 12,
  zoomMin: 40,
  zoomMax: 400000,
  zoomDefault: 900,

  fov: 60,
  easing: 0.12,
};

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(12);
  const [colorIndex, setColorIndex] = useState(0);

  const settingsRef = useRef<UISettings>({
    rows: 6,
    cols: 12,
    colorIndex: 0,
  });

  const sync = (key: keyof UISettings, value: number) => {
    settingsRef.current[key] = value;

    if (key === "rows") setRows(value);
    if (key === "cols") setCols(value);
    if (key === "colorIndex") setColorIndex(value);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      // 🎮 CAMERA ROTATION (clean orbit system)
      let rotX = 0;
      let rotY = 0;

      let targetRotX = 0;
      let targetRotY = 0;

      let camDist = SETTINGS.zoomDefault;
      let targetCamDist = SETTINGS.zoomDefault;

      let dragging = false;
      let lastX = 0;
      let lastY = 0;

      // smoothness
      const dragSpeed = 0.1;
      const friction = 0.86;

      let velX = 0;
      let velY = 0;

      p.setup = () => {
        const w = containerRef.current?.offsetWidth || 800;
        const h = containerRef.current?.offsetHeight || 500;

        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);

        const fov = (SETTINGS.fov * Math.PI) / 180;
        p.perspective(fov, w / h, 1, 200000);
      };

      p.draw = () => {
        p.background(0);

        const { rows, cols, colorIndex } = settingsRef.current;
        const preset = COLOR_PRESETS[colorIndex];

        // camera
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing);
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);

        // =========================
        // 🌌 NEW ROTATION SYSTEM
        // =========================

        // inertia
        velX *= friction;
        velY *= friction;

        targetRotX += velX;
        targetRotY += velY;

        targetRotX = p.constrain(targetRotX, -85, 85);

        rotX = p.lerp(rotX, targetRotX, 0.12);
        rotY = p.lerp(rotY, targetRotY, 0.12);

        p.rotateX(rotX);
        p.rotateY(rotY);

        drawGrid(p, rows, cols, preset);
      };

      function drawGrid(p: p5, rows: number, cols: number, preset: any) {
        const t = p.frameCount * 0.02;

        const zStep = 180 / rows;
        const xStep = 360 / cols;

        for (let z = 0; z < 180; z += zStep) {
          for (let x = 0; x < 360; x += xStep) {
            const wave =
              ((z / 180 + x / 360) * 0.5 +
                Math.sin((t + z + x) * 0.05) * 0.5 +
                0.5) %
              1;

            const r = p.lerp(preset.b[0], preset.a[0], wave);
            const g = p.lerp(preset.b[1], preset.a[1], wave);
            const b = p.lerp(preset.b[2], preset.a[2], wave);

            for (let gl = SETTINGS.glowLayers; gl >= 0; gl--) {
              const size =
                SETTINGS.boxSize +
                gl * SETTINGS.glowOffset * SETTINGS.boxSize * 0.25;

              const alpha = gl > 0 ? p.map(gl, 1, 2, 60, 20) : 255;

              p.push();
              p.rotateZ(z);
              p.rotateX(x);
              p.translate(0, SETTINGS.radius, 0);

              p.stroke(r, g, b, alpha);
              p.strokeWeight(
                gl > 0 ? SETTINGS.strokeWeight * 2 : SETTINGS.strokeWeight,
              );

              p.noFill();
              p.box(size);
              p.pop();
            }
          }
        }
      }

      // =========================
      // 🖱️ FULL FREE DIRECTION DRAG
      // =========================
      p.mousePressed = () => {
        dragging = true;
        lastX = p.mouseX;
        lastY = p.mouseY;
      };

      p.mouseReleased = () => {
        dragging = false;
      };

      p.mouseDragged = () => {
        if (!dragging) return;

        const dx = p.mouseX - lastX;
        const dy = p.mouseY - lastY;

        // 🔥 CORE CHANGE:
        // diagonal, free rotation feel
        velY += dx * dragSpeed;
        velX += dy * dragSpeed;

        lastX = p.mouseX;
        lastY = p.mouseY;
      };

      // =========================
      // ZOOM
      // =========================
      p.mouseWheel = (e: WheelEvent) => {
        targetCamDist += e.deltaY * SETTINGS.zoomSensitivity;
        targetCamDist = p.constrain(
          targetCamDist,
          SETTINGS.zoomMin,
          SETTINGS.zoomMax,
        );
        return false;
      };

      p.windowResized = () => {
        if (!containerRef.current) return;

        p.resizeCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight,
        );
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
          fontSize: 12,
        }}
      >
        <div>
          Rows: {rows}
          <input
            type="range"
            min={2}
            max={20}
            value={rows}
            onChange={(e) => sync("rows", Number(e.target.value))}
          />
        </div>

        <div>
          Columns: {cols}
          <input
            type="range"
            min={4}
            max={40}
            value={cols}
            onChange={(e) => sync("cols", Number(e.target.value))}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          {COLOR_PRESETS.map((c, i) => (
            <button
              key={i}
              onClick={() => sync("colorIndex", i)}
              style={{
                marginRight: 6,
                padding: "4px 8px",
                background: i === colorIndex ? "#fff" : "#222",
                color: i === colorIndex ? "#000" : "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
