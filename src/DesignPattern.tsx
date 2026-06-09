import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import Screenshot from "./components/Screenshot";

type UISettings = {
  rows: number;
  cols: number;
  colorIndex: number;
  spread: number;
  shapeKey: ShapeKey;
  organicMode: boolean;
  organicIntensity: number;
  morphMode: boolean;
  randomShapes: boolean;
  cycleColors: boolean;
  autoRotate: boolean;
  rotateSpeed: number;
};

type ShapeKey = "box" | "sphere" | "cone" | "torus" | "cylinder" | "star";

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
  zoomSensitivity: 120,
  zoomMin: 40,
  zoomMax: 400000,
  zoomDefault: 9000,
  fov: 60,
  easing: 0.12,
};

const SHAPE_KEYS_DETERMINISTIC: ShapeKey[] = [
  "box",
  "sphere",
  "cone",
  "torus",
  "cylinder",
  "star",
];

type ShapeFn = (
  p: p5,
  size: number,
  t: number,
  wave: number,
  organic: boolean,
  intensity: number,
) => void;

const shapeRegistry: Record<string, ShapeFn> = {
  box: (p, size, t, wave, organic, intensity) => {
    const pulse = organic
      ? size * (1 + intensity * 0.18 * Math.sin(t * 3.1 + wave * 6.28))
      : size;
    p.box(pulse);
  },
  sphere: (p, size, t, wave, organic, intensity) => {
    const r = organic
      ? size * 0.6 * (1 + intensity * 0.15 * Math.sin(t * 2.7 + wave * 6.28))
      : size * 0.6;
    // Flat circle drawn as a polygon in the XY plane
    const steps = 32;
    p.beginShape();
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      p.vertex(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    }
    p.endShape(p.CLOSE);
  },
  cone: (p, size, t, wave, organic, intensity) => {
    const h = organic
      ? size * (1.4 + intensity * 0.3 * Math.sin(t * 2.2 + wave * 6.28))
      : size * 1.4;
    p.cone(size * 0.5, h, 6, 1, false);
  },
  torus: (p, size, t, wave, organic, intensity) => {
    const tube = organic
      ? size * (0.12 + intensity * 0.06 * Math.sin(t * 3.5 + wave * 6.28))
      : size * 0.12;
    p.torus(size * 0.45, tube, 8, 5);
  },
  cylinder: (p, size, t, wave, organic, intensity) => {
    const h = organic
      ? size * (1.2 + intensity * 0.25 * Math.sin(t * 1.8 + wave * 6.28))
      : size * 1.2;
    p.cylinder(size * 0.38, h, 6, 1, false, false);
  },
  star: (p, size, t, wave, organic, intensity) => {
    const pulse = organic
      ? size * (1 + intensity * 0.2 * Math.sin(t * 4.0 + wave * 6.28))
      : size;
    p.push();
    p.box(pulse, pulse * 0.3, pulse * 0.3);
    p.pop();
    p.push();
    p.rotateX(60);
    p.box(pulse * 0.3, pulse, pulse * 0.3);
    p.pop();
    p.push();
    p.rotateZ(60);
    p.box(pulse * 0.3, pulse * 0.3, pulse);
    p.pop();
  },
};

function buildShapeGrid(rows: number, cols: number): ShapeKey[][] {
  const grid: ShapeKey[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] =
        SHAPE_KEYS_DETERMINISTIC[
          Math.floor(Math.random() * SHAPE_KEYS_DETERMINISTIC.length)
        ];
    }
  }
  return grid;
}

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(12);
  const [colorIndex, setColorIndex] = useState(0);
  const [spread, setSpread] = useState(1.0);
  const [shapeKey, setShapeKey] = useState<ShapeKey>("box");
  const [organicMode, setOrganicMode] = useState(false);
  const [organicIntensity, setOrganicIntensity] = useState(1.0);
  const [morphMode, setMorphMode] = useState(false);
  const [randomShapes, setRandomShapes] = useState(false);
  const [cycleColors, setCycleColors] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotateSpeed, setRotateSpeed] = useState(0.3);
  const [panelOpen, setPanelOpen] = useState(true);

  const settingsRef = useRef<UISettings>({
    rows: 6,
    cols: 12,
    colorIndex: 0,
    spread: 1.0,
    shapeKey: "box",
    organicMode: false,
    organicIntensity: 1.0,
    morphMode: false,
    randomShapes: false,
    cycleColors: false,
    autoRotate: false,
    rotateSpeed: 0.3,
  });

  const morphRef = useRef({
    from: "box" as ShapeKey,
    to: "box" as ShapeKey,
    blend: 1.0,
    transitioning: false,
  });

  const shapeGridRef = useRef<ShapeKey[][]>(buildShapeGrid(6, 12));

  // ── Override #root to fullscreen, reset on unmount ──
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const prev = {
      width: root.style.width,
      maxWidth: root.style.maxWidth,
      margin: root.style.margin,
      borderInline: root.style.borderInline,
      height: root.style.height,
      display: root.style.display,
    };
    root.style.width = "100vw";
    root.style.maxWidth = "100vw";
    root.style.margin = "0";
    root.style.borderInline = "none";
    root.style.height = "100vh";
    root.style.display = "block";
    return () => {
      root.style.width = prev.width;
      root.style.maxWidth = prev.maxWidth;
      root.style.margin = prev.margin;
      root.style.borderInline = prev.borderInline;
      root.style.height = prev.height;
      root.style.display = prev.display;
    };
  }, []);

  const sync = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    const prev = settingsRef.current[key];
    settingsRef.current[key] = value;
    if (key === "rows") {
      setRows(value as number);
      shapeGridRef.current = buildShapeGrid(
        value as number,
        settingsRef.current.cols,
      );
    }
    if (key === "cols") {
      setCols(value as number);
      shapeGridRef.current = buildShapeGrid(
        settingsRef.current.rows,
        value as number,
      );
    }
    if (key === "colorIndex") setColorIndex(value as number);
    if (key === "spread") setSpread(value as number);
    if (key === "organicMode") setOrganicMode(value as boolean);
    if (key === "organicIntensity") setOrganicIntensity(value as number);
    if (key === "morphMode") setMorphMode(value as boolean);
    if (key === "cycleColors") setCycleColors(value as boolean);
    if (key === "autoRotate") setAutoRotate(value as boolean);
    if (key === "rotateSpeed") setRotateSpeed(value as number);
    if (key === "randomShapes") {
      setRandomShapes(value as boolean);
      if (value)
        shapeGridRef.current = buildShapeGrid(
          settingsRef.current.rows,
          settingsRef.current.cols,
        );
    }
    if (key === "shapeKey") {
      setShapeKey(value as ShapeKey);
      if (settingsRef.current.morphMode && prev !== value) {
        morphRef.current.from = prev as ShapeKey;
        morphRef.current.to = value as ShapeKey;
        morphRef.current.blend = 0.0;
        morphRef.current.transitioning = true;
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let rotX = 0,
        rotY = 0,
        targetRotX = 0,
        targetRotY = 0;
      let camDist = SETTINGS.zoomDefault,
        targetCamDist = SETTINGS.zoomDefault;
      let dragging = false,
        lastX = 0,
        lastY = 0;
      let velX = 0,
        velY = 0;
      const dragSpeed = 0.1,
        friction = 0.86;

      // Smooth color cycling state (lives inside the sketch)
      let cycleT = 0; // 0..N (float, wraps per preset count)

      p.setup = () => {
        const w = containerRef.current?.offsetWidth || 800;
        const h = containerRef.current?.offsetHeight || 500;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
        p.perspective((SETTINGS.fov * Math.PI) / 180, w / h, 1, 200000);
      };

      p.draw = () => {
        p.background(0);
        const {
          rows,
          cols,
          colorIndex,
          spread,
          shapeKey,
          organicMode,
          organicIntensity,
          randomShapes,
        } = settingsRef.current;
        // Smooth color cycling: advance cycleT each frame when active
        if (settingsRef.current.cycleColors) {
          cycleT = (cycleT + 0.004) % COLOR_PRESETS.length;
        } else {
          // Snap cycleT to current colorIndex so resuming cycle feels natural
          cycleT = colorIndex;
        }
        const cycleFrom = Math.floor(cycleT) % COLOR_PRESETS.length;
        const cycleTo = (cycleFrom + 1) % COLOR_PRESETS.length;
        const cycleFrac = cycleT - Math.floor(cycleT);
        // Smoothstep for eased blend
        const sf = cycleFrac * cycleFrac * (3 - 2 * cycleFrac);
        const blendedPreset = {
          a: [
            COLOR_PRESETS[cycleFrom].a[0] * (1 - sf) +
              COLOR_PRESETS[cycleTo].a[0] * sf,
            COLOR_PRESETS[cycleFrom].a[1] * (1 - sf) +
              COLOR_PRESETS[cycleTo].a[1] * sf,
            COLOR_PRESETS[cycleFrom].a[2] * (1 - sf) +
              COLOR_PRESETS[cycleTo].a[2] * sf,
          ],
          b: [
            COLOR_PRESETS[cycleFrom].b[0] * (1 - sf) +
              COLOR_PRESETS[cycleTo].b[0] * sf,
            COLOR_PRESETS[cycleFrom].b[1] * (1 - sf) +
              COLOR_PRESETS[cycleTo].b[1] * sf,
            COLOR_PRESETS[cycleFrom].b[2] * (1 - sf) +
              COLOR_PRESETS[cycleTo].b[2] * sf,
          ],
        };
        const preset = settingsRef.current.cycleColors
          ? blendedPreset
          : COLOR_PRESETS[colorIndex];
        const morph = morphRef.current;
        if (morph.transitioning) {
          morph.blend = Math.min(1, morph.blend + 0.035);
          if (morph.blend >= 1) morph.transitioning = false;
        }
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing);
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);
        velX *= friction;
        velY *= friction;
        // Auto-rotate: add to velocity so manual drag can still override naturally
        if (settingsRef.current.autoRotate) {
          velY += settingsRef.current.rotateSpeed * 0.18;
        }
        targetRotX += velX;
        targetRotY += velY;
        targetRotX = p.constrain(targetRotX, -85, 85);
        // Wrap targetRotY so it doesn't grow unbounded during auto-rotate
        targetRotY = targetRotY % 360;
        rotX = p.lerp(rotX, targetRotX, 0.12);
        rotY = p.lerp(rotY, targetRotY, 0.12);
        p.rotateX(rotX);
        p.rotateY(rotY);
        drawGrid(
          p,
          rows,
          cols,
          spread,
          preset,
          shapeKey,
          organicMode,
          organicIntensity,
          randomShapes,
        );
      };

      function drawGrid(
        p: p5,
        rows: number,
        cols: number,
        spread: number,
        preset: { a: number[]; b: number[] },
        shapeKey: ShapeKey,
        organic: boolean,
        organicIntensity: number,
        randomShapes: boolean,
      ) {
        const t = p.frameCount * 0.02;
        const radius = SETTINGS.radius * spread;
        const boxSz = SETTINGS.boxSize * Math.max(0.3, spread * 0.6 + 0.4);
        const zStep = 180 / rows;
        const xStep = 360 / cols;
        let ri = 0;
        for (let z = 0; z < 180; z += zStep) {
          let ci = 0;
          for (let x = 0; x < 360; x += xStep) {
            const wave =
              ((z / 180 + x / 360) * 0.5 +
                Math.sin((t + z + x) * 0.05) * 0.5 +
                0.5) %
              1;
            let sz = boxSz;
            if (organic) {
              const noiseVal =
                0.5 +
                organicIntensity *
                  0.3 *
                  Math.sin(t * 1.1 + z * 0.07 + x * 0.05) +
                organicIntensity *
                  0.2 *
                  Math.sin(t * 2.3 - z * 0.12 + x * 0.09);
              sz = boxSz * (0.5 + noiseVal * 1.0);
            }
            const r = p.lerp(preset.b[0], preset.a[0], wave);
            const g = p.lerp(preset.b[1], preset.a[1], wave);
            const b = p.lerp(preset.b[2], preset.a[2], wave);
            const cellShape: ShapeKey = randomShapes
              ? (shapeGridRef.current[ri]?.[ci] ?? "box")
              : shapeKey;
            for (let gl = SETTINGS.glowLayers; gl >= 0; gl--) {
              const glowSize = sz + gl * SETTINGS.glowOffset * sz * 0.25;
              const alpha = gl > 0 ? p.map(gl, 1, 2, 60, 20) : 255;
              p.push();
              p.rotateZ(z);
              p.rotateX(x);
              p.translate(0, radius, 0);
              if (organic) {
                p.rotateY(t * 30 * organicIntensity + z * 0.5 + x * 0.3);
                p.rotateX(t * 20 * organicIntensity * Math.sin(z * 0.04));
              }
              p.stroke(r, g, b, alpha);
              p.strokeWeight(
                gl > 0 ? SETTINGS.strokeWeight * 2 : SETTINGS.strokeWeight,
              );
              p.noFill();
              renderShape(
                p,
                cellShape,
                glowSize,
                t,
                wave,
                organic,
                organicIntensity,
              );
              p.pop();
            }
            ci++;
          }
          ri++;
        }
      }

      function renderShape(
        p: p5,
        key: ShapeKey,
        size: number,
        t: number,
        wave: number,
        organic: boolean,
        organicIntensity: number,
      ) {
        const morph = morphRef.current;
        if (!morph.transitioning || morph.blend >= 1) {
          (shapeRegistry[key] ?? shapeRegistry["box"])(
            p,
            size,
            t,
            wave,
            organic,
            organicIntensity,
          );
          return;
        }
        p.push();
        p.scale((1 - morph.blend) * 1.0);
        (shapeRegistry[morph.from] ?? shapeRegistry["box"])(
          p,
          size,
          t,
          wave,
          organic,
          organicIntensity,
        );
        p.pop();
        p.push();
        p.scale(morph.blend);
        (shapeRegistry[morph.to] ?? shapeRegistry["box"])(
          p,
          size,
          t,
          wave,
          organic,
          organicIntensity,
        );
        p.pop();
      }

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
        velY += (p.mouseX - lastX) * dragSpeed;
        velX += (p.mouseY - lastY) * dragSpeed;
        lastX = p.mouseX;
        lastY = p.mouseY;
      };
      p.mouseWheel = (e: WheelEvent) => {
        targetCamDist = p.constrain(
          targetCamDist + e.deltaY * SETTINGS.zoomSensitivity,
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

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    whiteSpace: "nowrap",
  };
  const sliderStyle: React.CSSProperties = {
    width: 110,
    accentColor: "#00b4ff",
  };
  const btnBase: React.CSSProperties = {
    padding: "4px 10px",
    border: "1px solid #333",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: 11,
    transition: "all 0.15s",
  };
  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: "#fff",
    color: "#000",
  };
  const btnInactive: React.CSSProperties = {
    ...btnBase,
    background: "#111",
    color: "#ccc",
  };

  const SHAPE_OPTIONS: { key: ShapeKey; label: string }[] = [
    { key: "box", label: "□ Box" },
    { key: "sphere", label: "○ Circle" },
    { key: "cone", label: "△ Cone" },
    { key: "torus", label: "◎ Torus" },
    { key: "cylinder", label: "⬭ Cylinder" },
    { key: "star", label: "✦ Star" },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <Screenshot targetRef={containerRef} />

      {/* Toggle Button */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        title={panelOpen ? "Hide controls" : "Show controls"}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 20,
          width: 32,
          height: 32,
          background: panelOpen ? "rgba(0,180,255,0.15)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${panelOpen ? "rgba(0,210,255,0.5)" : "rgba(255,255,255,0.12)"}`,
          backdropFilter: "blur(6px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, border-color 0.2s",
          padding: 0,
        }}
      >
        {panelOpen ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 2L12 12M12 2L2 12"
              stroke="rgba(0,210,255,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 3.5H12M2 7H12M2 10.5H12"
              stroke="rgba(0,210,255,0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          fontSize: 12,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.08)",
          minWidth: 260,
          userSelect: "none",
          opacity: panelOpen ? 1 : 0,
          pointerEvents: panelOpen ? "auto" : "none",
          transform: panelOpen ? "translateY(0px)" : "translateY(-6px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          paddingTop: 48,
          paddingBottom: 14,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div
          style={{
            color: "#00b4ff",
            marginBottom: 8,
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          GEOMETRY
        </div>
        <div style={labelStyle}>
          <span style={{ width: 60 }}>Rows: {rows}</span>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={rows}
            style={sliderStyle}
            onChange={(e) => sync("rows", Number(e.target.value))}
          />
        </div>
        <div style={labelStyle}>
          <span style={{ width: 60 }}>Cols: {cols}</span>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={cols}
            style={sliderStyle}
            onChange={(e) => sync("cols", Number(e.target.value))}
          />
        </div>
        <div style={{ ...labelStyle, marginBottom: 14 }}>
          <span style={{ width: 60 }}>Spread: {spread.toFixed(2)}</span>
          <input
            type="range"
            min={0.2}
            max={4.0}
            step={0.05}
            value={spread}
            style={sliderStyle}
            onChange={(e) => sync("spread", Number(e.target.value))}
          />
        </div>

        <div
          style={{
            color: "#00b4ff",
            marginBottom: 8,
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          SHAPE
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            marginBottom: 14,
          }}
        >
          {SHAPE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              style={shapeKey === key ? btnActive : btnInactive}
              onClick={() => sync("shapeKey", key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          style={{
            color: "#00b4ff",
            marginBottom: 8,
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          MODES
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: organicMode ? 8 : 14,
          }}
        >
          <button
            style={organicMode ? btnActive : btnInactive}
            onClick={() => sync("organicMode", !organicMode)}
          >
            ⬡ Organic
          </button>
          <button
            style={morphMode ? btnActive : btnInactive}
            onClick={() => sync("morphMode", !morphMode)}
          >
            ↭ Morph
          </button>
          <button
            style={randomShapes ? btnActive : btnInactive}
            onClick={() => sync("randomShapes", !randomShapes)}
          >
            ⁂ Mixed
          </button>
        </div>

        {/* Organic Intensity Slider — only shown when organic is active */}
        {organicMode && (
          <div style={{ ...labelStyle, marginBottom: 14, opacity: 0.9 }}>
            <span style={{ width: 60 }}>
              Intensity: {organicIntensity.toFixed(2)}
            </span>
            <input
              type="range"
              min={0.0}
              max={3.0}
              step={0.05}
              value={organicIntensity}
              style={sliderStyle}
              onChange={(e) => sync("organicIntensity", Number(e.target.value))}
            />
          </div>
        )}

        <div
          style={{
            color: "#00b4ff",
            marginBottom: 8,
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          ROTATION
        </div>
        <div
          style={{ display: "flex", gap: 6, marginBottom: autoRotate ? 8 : 14 }}
        >
          <button
            style={autoRotate ? btnActive : btnInactive}
            onClick={() => sync("autoRotate", !autoRotate)}
          >
            ↻ Auto-Rotate
          </button>
        </div>
        {autoRotate && (
          <div style={{ ...labelStyle, marginBottom: 14, opacity: 0.9 }}>
            <span style={{ width: 60 }}>Speed: {rotateSpeed.toFixed(2)}</span>
            <input
              type="range"
              min={0.05}
              max={3.0}
              step={0.05}
              value={rotateSpeed}
              style={sliderStyle}
              onChange={(e) => sync("rotateSpeed", Number(e.target.value))}
            />
          </div>
        )}

        <div
          style={{
            color: "#00b4ff",
            marginBottom: 8,
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          COLOR
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {COLOR_PRESETS.map((c, i) => (
            <button
              key={i}
              style={i === colorIndex && !cycleColors ? btnActive : btnInactive}
              onClick={() => {
                sync("cycleColors", false);
                sync("colorIndex", i);
              }}
            >
              {c.name}
            </button>
          ))}
          <button
            style={cycleColors ? btnActive : btnInactive}
            onClick={() => sync("cycleColors", !cycleColors)}
            title="Automatically cycle through all colors"
          >
            ↻ Cycle
          </button>
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          color: "rgba(255,255,255,0.25)",
          fontFamily: "monospace",
          fontSize: 10,
          pointerEvents: "none",
        }}
      >
        drag to rotate · scroll to zoom
      </div>
    </div>
  );
}
