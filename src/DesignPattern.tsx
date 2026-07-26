import { useEffect, useRef, useState, type RefObject } from "react";
import p5 from "p5";
import Screenshot from "./components/Screenshot";
import ControlPanel from "./ControlPanel";
import Cutscene from "./Cutscene";
import DesktopOnlyGate, { useIsDesktop } from "./DesktopOnlyGate";

/* ══════════════════════════════════════════════
   SYSTEM — Typen, Konstanten, Formen, Sketch.
   Alles, was nichts mit der UI zu tun hat.
══════════════════════════════════════════════ */

export type ShapeKey =
  | "box"
  | "sphere"
  | "cone"
  | "torus"
  | "cylinder"
  | "star";

export type Distribution = "sphere" | "flat" | "fibonacci" | "helix";

export type UISettings = {
  rows: number;
  cols: number;
  colorIndex: number;
  spread: number;
  shapeKey: ShapeKey;
  distribution: Distribution;
  organicMode: boolean;
  organicIntensity: number;
  morphMode: boolean;
  randomShapes: boolean;
  cycleColors: boolean;
  autoRotate: boolean;
  rotateSpeed: number;
  spiralDrift: boolean;
  spiralSpeed: number;
  explodePulse: boolean;
  explodeSpeed: number;
};

type MorphState = {
  from: ShapeKey;
  to: ShapeKey;
  blend: number;
  transitioning: boolean;
};

export const COLOR_PRESETS = [
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

export const SHAPE_OPTIONS: { key: ShapeKey; label: string }[] = [
  { key: "box", label: "□ Box" },
  { key: "sphere", label: "○ Circle" },
  { key: "cone", label: "△ Cone" },
  { key: "torus", label: "◎ Torus" },
  { key: "cylinder", label: "⬭ Cylinder" },
  { key: "star", label: "✦ Star" },
];

export const DISTRIBUTION_OPTIONS: { key: Distribution; label: string }[] = [
  { key: "sphere", label: "◯ Sphere" },
  { key: "flat", label: "▦ Flat" },
  { key: "fibonacci", label: "❋ Fibonacci" },
  { key: "helix", label: "🧬 Helix" },
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

/* ══════════════════════════════════════════════
   KOMPONENTE — State + p5-Lifecycle + Rendering.
   Die UI selbst steckt komplett in ControlPanel.tsx.
══════════════════════════════════════════════ */

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(12);
  const [colorIndex, setColorIndex] = useState(0);
  const [spread, setSpread] = useState(1.0);
  const [shapeKey, setShapeKey] = useState<ShapeKey>("box");
  const [distribution, setDistribution] = useState<Distribution>("sphere");
  const [organicMode, setOrganicMode] = useState(false);
  const [organicIntensity, setOrganicIntensity] = useState(1.0);
  const [morphMode, setMorphMode] = useState(false);
  const [randomShapes, setRandomShapes] = useState(false);
  const [cycleColors, setCycleColors] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotateSpeed, setRotateSpeed] = useState(0.3);
  const [spiralDrift, setSpiralDrift] = useState(false);
  const [spiralSpeed, setSpiralSpeed] = useState(1.0);
  const [explodePulse, setExplodePulse] = useState(false);
  const [explodeSpeed, setExplodeSpeed] = useState(1.0);
  const [panelOpen, setPanelOpen] = useState(true);

  const settingsRef = useRef<UISettings>({
    rows: 6,
    cols: 12,
    colorIndex: 0,
    spread: 1.0,
    shapeKey: "box",
    distribution: "sphere",
    organicMode: false,
    organicIntensity: 1.0,
    morphMode: false,
    randomShapes: false,
    cycleColors: false,
    autoRotate: false,
    rotateSpeed: 0.3,
    spiralDrift: false,
    spiralSpeed: 1.0,
    explodePulse: false,
    explodeSpeed: 1.0,
  });

  const morphRef = useRef<MorphState>({
    from: "box",
    to: "box",
    blend: 1.0,
    transitioning: false,
  });

  const shapeGridRef = useRef<ShapeKey[][]>(buildShapeGrid(6, 12));

  // Burst trigger: set to true to fire a one-shot explode/implode
  const burstRef = useRef(false);

  // Cutscene-Kamerasteuerung: solange nicht null, überschreibt dieser
  // Wert die Zoom-Zielposition jeden Frame (sanft, über die bestehende
  // Lerp-Logik). Null = Nutzer hat wieder normale Scroll-Kontrolle.
  const zoomTargetRef = useRef<number | null>(null);

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
    if (key === "spiralDrift") setSpiralDrift(value as boolean);
    if (key === "spiralSpeed") setSpiralSpeed(value as number);
    if (key === "explodePulse") setExplodePulse(value as boolean);
    if (key === "explodeSpeed") setExplodeSpeed(value as number);
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
    if (key === "distribution") setDistribution(value as Distribution);
  };

  useEffect(() => {
    if (!containerRef.current || !isDesktop) return;

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

      let cycleT = 0;
      const rowDriftOffsets: number[] = [];
      let explodePhase = 0;

      p.setup = () => {
        const w = containerRef.current?.offsetWidth || 800;
        const h = containerRef.current?.offsetHeight || 500;
        p.createCanvas(w, h, p.WEBGL);
        p.angleMode(p.DEGREES);
        p.perspective((SETTINGS.fov * Math.PI) / 180, w / h, 1, 200000);

        for (let i = 0; i < 40; i++) rowDriftOffsets[i] = 0;
      };

      p.draw = () => {
        p.background(0);
        const {
          rows,
          cols,
          colorIndex,
          spread,
          shapeKey,
          distribution,
          organicMode,
          organicIntensity,
          randomShapes,
          spiralDrift,
          spiralSpeed,
        } = settingsRef.current;

        if (spiralDrift) {
          for (let ri = 0; ri < rows; ri++) {
            const lat = ri / Math.max(rows - 1, 1);
            const speedMult =
              Math.sin(lat * Math.PI) *
              Math.sin(lat * Math.PI * 3 + p.frameCount * 0.002 * spiralSpeed);
            rowDriftOffsets[ri] =
              (rowDriftOffsets[ri] + spiralSpeed * 0.18 * speedMult) % 360;
          }
        }

        if (burstRef.current) {
          burstRef.current = false;
          explodePhase = 0.001;
        }
        if (settingsRef.current.explodePulse && explodePhase === 0) {
          explodePhase = 0.001;
        }
        if (explodePhase > 0) {
          explodePhase = Math.min(
            2,
            explodePhase + 0.012 * settingsRef.current.explodeSpeed,
          );
          if (explodePhase >= 2) explodePhase = 0;
        }
        let explodeMult = 1.0;
        if (explodePhase > 0) {
          const half = explodePhase < 1 ? explodePhase : 2 - explodePhase;
          const eased = half * half * (3 - 2 * half);
          explodeMult = 1.0 + eased * 2.5;
        }

        if (settingsRef.current.cycleColors) {
          cycleT = (cycleT + 0.004) % COLOR_PRESETS.length;
        } else {
          cycleT = colorIndex;
        }
        const cycleFrom = Math.floor(cycleT) % COLOR_PRESETS.length;
        const cycleTo = (cycleFrom + 1) % COLOR_PRESETS.length;
        const cycleFrac = cycleT - Math.floor(cycleT);
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

        if (zoomTargetRef.current !== null) {
          targetCamDist = zoomTargetRef.current;
        }
        camDist = p.lerp(camDist, targetCamDist, SETTINGS.easing);
        p.camera(0, 0, camDist, 0, 0, 0, 0, 1, 0);

        velX *= friction;
        velY *= friction;
        if (settingsRef.current.autoRotate) {
          velY += settingsRef.current.rotateSpeed * 0.18;
        }
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
          distribution,
          organicMode,
          organicIntensity,
          randomShapes,
          spiralDrift,
          rowDriftOffsets,
          explodeMult,
        );
      };

      function drawGrid(
        p: p5,
        rows: number,
        cols: number,
        spread: number,
        preset: { a: number[]; b: number[] },
        shapeKey: ShapeKey,
        distribution: Distribution,
        organic: boolean,
        organicIntensity: number,
        randomShapes: boolean,
        spiralDrift: boolean,
        driftOffsets: number[],
        explodeMult: number,
      ) {
        const t = p.frameCount * 0.02;
        const radius = SETTINGS.radius * spread * explodeMult;
        const boxSz = SETTINGS.boxSize * Math.max(0.3, spread * 0.6 + 0.4);
        const zStep = 180 / rows;
        const xStep = 360 / cols;
        let ri = 0;
        for (let z = 0; z < 180; z += zStep) {
          let ci = 0;
          const drift = spiralDrift ? (driftOffsets[ri] ?? 0) : 0;
          for (let x = 0; x < 360; x += xStep) {
            const xDrifted = x + drift;
            const wave =
              ((z / 180 + xDrifted / 360) * 0.5 +
                Math.sin((t + z + xDrifted) * 0.05) * 0.5 +
                0.5) %
              1;
            let sz = boxSz;
            if (organic) {
              const noiseVal =
                0.5 +
                organicIntensity *
                  0.3 *
                  Math.sin(t * 1.1 + z * 0.07 + xDrifted * 0.05) +
                organicIntensity *
                  0.2 *
                  Math.sin(t * 2.3 - z * 0.12 + xDrifted * 0.09);
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

              if (distribution === "flat") {
                // ── Flat: klassisches ebenes Raster ──
                const flatSpacing = (radius / Math.max(rows, cols)) * 2.4;
                const flatW = (cols - 1) * flatSpacing;
                const flatH = (rows - 1) * flatSpacing;
                p.translate(
                  ci * flatSpacing - flatW / 2,
                  ri * flatSpacing - flatH / 2,
                  0,
                );
              } else if (distribution === "fibonacci") {
                // ── Fibonacci-Kugel: golden-angle Verteilung ──
                const idx = ri * cols + ci;
                const total = rows * cols;
                const goldenAngle = Math.PI * (3 - Math.sqrt(5));
                const fy = 1 - (idx / Math.max(total - 1, 1)) * 2;
                const radAtY = Math.sqrt(Math.max(0, 1 - fy * fy));
                const theta = goldenAngle * idx;
                p.translate(
                  Math.cos(theta) * radAtY * radius,
                  fy * radius,
                  Math.sin(theta) * radAtY * radius,
                );
              } else if (distribution === "helix") {
                // ── Doppel-Helix: zwei um 180° versetzte Spiralen
                // entlang einer gemeinsamen Achse (DNA-artig) ──
                const idx = ri * cols + ci;
                const total = rows * cols;
                const totalPairs = Math.max(Math.ceil(total / 2), 1);
                const pairIndex = Math.floor(idx / 2);
                const strand = idx % 2;
                const turns = 3;
                const twist =
                  (pairIndex / Math.max(totalPairs - 1, 1)) *
                  turns *
                  Math.PI *
                  2;
                const helixAngle = twist + strand * Math.PI;
                const helixRadius = radius * 0.35;
                const helixHeight = radius * 2.2;
                const hy =
                  (pairIndex / Math.max(totalPairs - 1, 1)) * helixHeight -
                  helixHeight / 2;
                p.translate(
                  Math.cos(helixAngle) * helixRadius,
                  hy,
                  Math.sin(helixAngle) * helixRadius,
                );
              } else {
                // ── Sphere (Standard): unverändert wie zuvor ──
                p.rotateZ(z);
                p.rotateX(xDrifted);
                p.translate(0, radius, 0);
              }

              if (organic) {
                p.rotateY(t * 30 * organicIntensity + z * 0.5 + xDrifted * 0.3);
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
        // Nur zoomen, wenn das Rad wirklich über der 3D-Szene benutzt
        // wird — sonst würde das Panel nie normal scrollen können,
        // weil preventDefault() global das native Scrollen blockiert.
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".dp-panel")) {
          return true;
        }
        targetCamDist = p.constrain(
          targetCamDist + e.deltaY * SETTINGS.zoomSensitivity,
          SETTINGS.zoomMin,
          SETTINGS.zoomMax,
        );
        return false;
      };

      // ── Touch: Ein Finger dreht, zwei Finger zoomen (Pinch) ──
      // Touches übers Control Panel werden ignoriert, damit natives
      // Scrollen im Panel weiter funktioniert (gleiches Prinzip wie
      // beim Mausrad oben).
      let pinchStartDist = 0;
      let pinchStartZoom = SETTINGS.zoomDefault;

      const isOverPanel = (e?: TouchEvent) => {
        const target = e?.target as HTMLElement | null;
        return !!(target && target.closest(".dp-panel"));
      };

      p.touchStarted = (e?: TouchEvent) => {
        if (isOverPanel(e)) return true;
        if (p.touches.length === 1) {
          dragging = true;
          lastX = (p.touches[0] as any).x;
          lastY = (p.touches[0] as any).y;
        } else if (p.touches.length === 2) {
          dragging = false;
          const t0 = p.touches[0] as any;
          const t1 = p.touches[1] as any;
          pinchStartDist = Math.hypot(t0.x - t1.x, t0.y - t1.y);
          pinchStartZoom = targetCamDist;
        }
        return false;
      };

      p.touchMoved = (e?: TouchEvent) => {
        if (isOverPanel(e)) return true;
        if (p.touches.length === 1 && dragging) {
          const t0 = p.touches[0] as any;
          velY += (t0.x - lastX) * dragSpeed;
          velX += (t0.y - lastY) * dragSpeed;
          lastX = t0.x;
          lastY = t0.y;
        } else if (p.touches.length === 2 && pinchStartDist > 0) {
          const t0 = p.touches[0] as any;
          const t1 = p.touches[1] as any;
          const dist = Math.hypot(t0.x - t1.x, t0.y - t1.y);
          const scale = pinchStartDist / Math.max(dist, 1);
          targetCamDist = p.constrain(
            pinchStartZoom * scale,
            SETTINGS.zoomMin,
            SETTINGS.zoomMax,
          );
        }
        return false;
      };

      p.touchEnded = (e?: TouchEvent) => {
        if (isOverPanel(e)) return true;
        dragging = false;
        pinchStartDist = 0;
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

  const state: UISettings = {
    rows,
    cols,
    colorIndex,
    spread,
    shapeKey,
    distribution,
    organicMode,
    organicIntensity,
    morphMode,
    randomShapes,
    cycleColors,
    autoRotate,
    rotateSpeed,
    spiralDrift,
    spiralSpeed,
    explodePulse,
    explodeSpeed,
  };

  return (
    <DesktopOnlyGate>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        <Screenshot targetRef={containerRef as RefObject<HTMLElement>} />

        <ControlPanel
          state={state}
          sync={sync}
          burstRef={burstRef}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((v) => !v)}
        />

        <Cutscene
          sync={sync}
          burstRef={burstRef}
          zoomTargetRef={zoomTargetRef}
          setPanelOpen={setPanelOpen}
        />

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
    </DesktopOnlyGate>
  );
}
