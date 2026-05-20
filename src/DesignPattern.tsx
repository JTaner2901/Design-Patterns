import { useEffect, useRef, useState } from "react";
import p5 from "p5";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type UISettings = {
  rows: number;
  cols: number;
  colorIndex: number;
  spread: number;
  shapeKey: ShapeKey;
  organicMode: boolean;
  morphMode: boolean;
  randomShapes: boolean;
};

type ShapeKey =
  | "box"
  | "sphere"
  | "cone"
  | "torus"
  | "cylinder"
  | "star"
  | "random";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

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

// All deterministic non-random shape keys (used for per-object random assignment)
const SHAPE_KEYS_DETERMINISTIC: ShapeKey[] = [
  "box",
  "sphere",
  "cone",
  "torus",
  "cylinder",
  "star",
];

// ─────────────────────────────────────────────
// SHAPE REGISTRY
//
// Each shape is a pure function: (p, size, t, wave, organic) => void
//
// WHY a registry?
//   - Adding shapes never touches the draw loop
//   - "random per object" just picks a random key
//   - wave + t are passed in so every shape pulses in sync
//     with the color animation automatically
// ─────────────────────────────────────────────

type ShapeFn = (
  p: p5,
  size: number,
  t: number,
  wave: number,
  organic: boolean,
) => void;

const shapeRegistry: Record<string, ShapeFn> = {
  box: (p, size, t, wave, organic) => {
    const pulse = organic
      ? size * (1 + 0.18 * Math.sin(t * 3.1 + wave * 6.28))
      : size;
    p.box(pulse);
  },

  sphere: (p, size, t, wave, organic) => {
    const r = organic
      ? size * 0.55 * (1 + 0.15 * Math.sin(t * 2.7 + wave * 6.28))
      : size * 0.55;
    p.sphere(r, 6, 5);
  },

  cone: (p, size, t, wave, organic) => {
    const h = organic
      ? size * (1.4 + 0.3 * Math.sin(t * 2.2 + wave * 6.28))
      : size * 1.4;
    const r = size * 0.5;
    p.cone(r, h, 6, 1, false);
  },

  torus: (p, size, t, wave, organic) => {
    const r = size * 0.45;
    const tube = organic
      ? size * (0.12 + 0.06 * Math.sin(t * 3.5 + wave * 6.28))
      : size * 0.12;
    p.torus(r, tube, 8, 5);
  },

  cylinder: (p, size, t, wave, organic) => {
    const h = organic
      ? size * (1.2 + 0.25 * Math.sin(t * 1.8 + wave * 6.28))
      : size * 1.2;
    const r = size * 0.38;
    p.cylinder(r, h, 6, 1, false, false);
  },

  // "star" — procedural: two rotated boxes = hexagram / asterism
  // WHY: p5 WEBGL has no star primitive, but overlapping transformed
  //      boxes produce a striking multi-axis cross that reads as a star burst
  star: (p, size, t, wave, organic) => {
    const pulse = organic
      ? size * (1 + 0.2 * Math.sin(t * 4.0 + wave * 6.28))
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

// ─────────────────────────────────────────────
// PER-OBJECT RANDOM SHAPE LOOKUP
//
// WHY a precomputed grid lookup instead of Math.random() in draw()?
//   Because draw() runs 60 fps — Math.random() in the hot loop would
//   produce flickering. We build the table once and index by (z, x).
// ─────────────────────────────────────────────
function buildShapeGrid(rows: number, cols: number): ShapeKey[][] {
  const grid: ShapeKey[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const idx = Math.floor(Math.random() * SHAPE_KEYS_DETERMINISTIC.length);
      grid[r][c] = SHAPE_KEYS_DETERMINISTIC[idx];
    }
  }
  return grid;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(12);
  const [colorIndex, setColorIndex] = useState(0);
  const [spread, setSpread] = useState(1.0);
  const [shapeKey, setShapeKey] = useState<ShapeKey>("box");
  const [organicMode, setOrganicMode] = useState(false);
  const [morphMode, setMorphMode] = useState(false);
  const [randomShapes, setRandomShapes] = useState(false);

  const settingsRef = useRef<UISettings>({
    rows: 6,
    cols: 12,
    colorIndex: 0,
    spread: 1.0,
    shapeKey: "box",
    organicMode: false,
    morphMode: false,
    randomShapes: false,
  });

  // Morph state lives in a ref — it's read 60fps inside draw(), never needs React re-render
  const morphRef = useRef({
    from: "box" as ShapeKey,
    to: "box" as ShapeKey,
    blend: 1.0, // 0 = fully "from", 1 = fully "to"
    transitioning: false,
  });

  // Random shape grid — rebuilt when rows/cols change or randomShapes toggled on
  const shapeGridRef = useRef<ShapeKey[][]>(buildShapeGrid(6, 12));

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
    if (key === "morphMode") setMorphMode(value as boolean);
    if (key === "randomShapes") {
      setRandomShapes(value as boolean);
      if (value)
        shapeGridRef.current = buildShapeGrid(
          settingsRef.current.rows,
          settingsRef.current.cols,
        );
    }

    // Shape change → trigger morph transition if morphMode is on
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

        const {
          rows,
          cols,
          colorIndex,
          spread,
          shapeKey,
          organicMode,
          randomShapes,
        } = settingsRef.current;
        const preset = COLOR_PRESETS[colorIndex];

        // Advance morph blend
        const morph = morphRef.current;
        if (morph.transitioning) {
          morph.blend = Math.min(1, morph.blend + 0.035);
          if (morph.blend >= 1) morph.transitioning = false;
        }

        // Camera
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing);
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);

        velX *= friction;
        velY *= friction;
        targetRotX += velX;
        targetRotY += velY;
        targetRotX = p.constrain(targetRotX, -85, 85);
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
          randomShapes,
        );
      };

      // ─── CORE DRAW LOOP ───────────────────────────────────────────────────────
      function drawGrid(
        p: p5,
        rows: number,
        cols: number,
        spread: number,
        preset: (typeof COLOR_PRESETS)[number],
        shapeKey: ShapeKey,
        organic: boolean,
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

            // Organic mode: perlin-ish size modulation using layered sines
            // (p5 noise() is available but sine layers are cheaper in WEBGL mode)
            let sz = boxSz;
            if (organic) {
              const noiseVal =
                0.5 +
                0.3 * Math.sin(t * 1.1 + z * 0.07 + x * 0.05) +
                0.2 * Math.sin(t * 2.3 - z * 0.12 + x * 0.09);
              sz = boxSz * (0.5 + noiseVal * 1.0);
            }

            const r = p.lerp(preset.b[0], preset.a[0], wave);
            const g = p.lerp(preset.b[1], preset.a[1], wave);
            const b = p.lerp(preset.b[2], preset.a[2], wave);

            // Determine shape for this cell
            // "random" mode uses precomputed grid so it's stable across frames
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

              // Organic rotation per object: subtle per-object spin
              if (organic) {
                p.rotateY(t * 30 + z * 0.5 + x * 0.3);
                p.rotateX(t * 20 * Math.sin(z * 0.04));
              }

              p.stroke(r, g, b, alpha);
              p.strokeWeight(
                gl > 0 ? SETTINGS.strokeWeight * 2 : SETTINGS.strokeWeight,
              );
              p.noFill();

              renderShape(p, cellShape, glowSize, t, wave, organic);

              p.pop();
            }
            ci++;
          }
          ri++;
        }
      }

      // ─── SHAPE RENDERER ───────────────────────────────────────────────────────
      // WHY a separate function?
      //   This is the only place that knows about morph blending.
      //   The registry functions are pure and don't need to know about each other.
      function renderShape(
        p: p5,
        key: ShapeKey,
        size: number,
        t: number,
        wave: number,
        organic: boolean,
      ) {
        const morph = morphRef.current;

        if (!morph.transitioning || morph.blend >= 1) {
          // Normal path — just call the registered shape function
          const fn = shapeRegistry[key] ?? shapeRegistry["box"];
          fn(p, size, t, wave, organic);
          return;
        }

        // Morph path — blend between two shapes by lerping their scale
        // WHY scale lerp, not geometry lerp?
        //   p5 WEBGL can't interpolate vertex buffers at runtime. Scale lerping
        //   is a convincing approximation: "from" shrinks while "to" grows.
        const fromFn = shapeRegistry[morph.from] ?? shapeRegistry["box"];
        const toFn = shapeRegistry[morph.to] ?? shapeRegistry["box"];
        const blend = morph.blend;

        // "From" shape shrinks out
        p.push();
        const fromScale = (1 - blend) * 1.0;
        p.scale(fromScale);
        fromFn(p, size, t, wave, organic);
        p.pop();

        // "To" shape grows in
        p.push();
        const toScale = blend;
        p.scale(toScale);
        toFn(p, size, t, wave, organic);
        p.pop();
      }

      // ─── INPUT HANDLERS (unchanged from original) ─────────────────────────────
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
        const dx = p.mouseX - lastX,
          dy = p.mouseY - lastY;
        velY += dx * dragSpeed;
        velX += dy * dragSpeed;
        lastX = p.mouseX;
        lastY = p.mouseY;
      };
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

  // ─── UI ───────────────────────────────────────────────────────────────────────

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
    { key: "sphere", label: "○ Sphere" },
    { key: "cone", label: "△ Cone" },
    { key: "torus", label: "◎ Torus" },
    { key: "cylinder", label: "⬭ Cylinder" },
    { key: "star", label: "✦ Star" },
    { key: "random", label: "⁂ Random" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* ── CONTROL PANEL ── */}
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
          padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.08)",
          minWidth: 260,
          userSelect: "none",
        }}
      >
        {/* ── GEOMETRY ── */}
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

        {/* ── SHAPES ── */}
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

        {/* ── MODES ── */}
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
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button
            style={organicMode ? btnActive : btnInactive}
            onClick={() => sync("organicMode", !organicMode)}
            title="Perlin-like sine deformation — shapes breathe and pulse"
          >
            ⬡ Organic
          </button>
          <button
            style={morphMode ? btnActive : btnInactive}
            onClick={() => sync("morphMode", !morphMode)}
            title="Smooth shape transitions when switching shapes"
          >
            ↭ Morph
          </button>
          <button
            style={randomShapes ? btnActive : btnInactive}
            onClick={() => sync("randomShapes", !randomShapes)}
            title="Each grid cell gets a randomly assigned shape"
          >
            ⁂ Mixed
          </button>
        </div>

        {/* ── COLOR ── */}
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
              style={i === colorIndex ? btnActive : btnInactive}
              onClick={() => sync("colorIndex", i)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── HINT ── */}
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
