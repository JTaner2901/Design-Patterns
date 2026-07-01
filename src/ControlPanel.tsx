import { useState, type MutableRefObject } from "react";
import {
  COLOR_PRESETS,
  SHAPE_OPTIONS,
  DISTRIBUTION_OPTIONS,
  type UISettings,
} from "./DesignPattern";

interface ControlPanelProps {
  state: UISettings;
  sync: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void;
  burstRef: MutableRefObject<boolean>;
  panelOpen: boolean;
  onTogglePanel: () => void;
}

/* ─────────────────────────────────────────────
   Styling — modernisiert: Poppins statt Monospace,
   Pill-Buttons statt harter Kästen, custom Slider.
───────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 8,
  whiteSpace: "nowrap",
};

const btnBase: React.CSSProperties = {
  padding: "6px 13px",
  borderRadius: 999,
  cursor: "pointer",
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
  fontSize: 11,
  letterSpacing: "0.02em",
  transition:
    "background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
};
const btnActive: React.CSSProperties = {
  ...btnBase,
  background: "rgba(0,210,255,0.16)",
  border: "1px solid rgba(0,210,255,0.55)",
  color: "#fff",
  boxShadow: "0 0 14px rgba(0,210,255,0.25)",
};
const btnInactive: React.CSSProperties = {
  ...btnBase,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "rgba(255,255,255,0.6)",
};
const sectionLabel: React.CSSProperties = {
  color: "rgba(0,210,255,0.85)",
  marginBottom: 10,
  letterSpacing: "0.18em",
  fontSize: 10,
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  textTransform: "uppercase",
};
const divider: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.07)",
  margin: "14px 0",
};
const valueLabel: React.CSSProperties = {
  width: 78,
  fontFamily: "'Poppins', sans-serif",
  fontSize: 11.5,
  color: "rgba(255,255,255,0.75)",
  fontWeight: 400,
};

/* ─────────────────────────────────────────────
   ColorDial — 5 Farbpunkte auf einem Ring,
   Zeiger rotiert zur aktiven Farbe. Im Cycle-Modus
   dreht sich der Zeiger sichtbar weiter (spiegelt
   den echten, sonst unsichtbaren Farb-Cycle wider).
   Mittlerer Hub-Punkt toggelt den Cycle-Modus.
───────────────────────────────────────────── */

function ColorDial({
  colorIndex,
  cycleColors,
  onSelect,
  onToggleCycle,
}: {
  colorIndex: number;
  cycleColors: boolean;
  onSelect: (i: number) => void;
  onToggleCycle: () => void;
}) {
  const size = 92;
  const center = size / 2;
  const ringRadius = 32;
  const n = COLOR_PRESETS.length;
  const angleFor = (i: number) => (360 / n) * i - 90;
  const pointerAngle = angleFor(colorIndex) + 90;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "4px 0 2px",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={ringRadius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={1}
        />

        {/* Zeiger */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={center - ringRadius + 6}
          stroke="#00d2ff"
          strokeWidth={2}
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 4px rgba(0,210,255,0.8))",
            transformOrigin: `${center}px ${center}px`,
            transform: cycleColors ? undefined : `rotate(${pointerAngle}deg)`,
            animation: cycleColors
              ? "dp-dial-spin 20s linear infinite"
              : "none",
            transition: cycleColors
              ? "none"
              : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />

        {/* Farbpunkte */}
        {COLOR_PRESETS.map((c, i) => {
          const rad = (angleFor(i) * Math.PI) / 180;
          const x = center + ringRadius * Math.cos(rad);
          const y = center + ringRadius * Math.sin(rad);
          const fill = `rgb(${c.a[0]}, ${c.a[1]}, ${c.a[2]})`;
          const active = i === colorIndex && !cycleColors;
          return (
            <circle
              key={c.name}
              cx={x}
              cy={y}
              r={active ? 6.5 : 5}
              fill={fill}
              stroke={active ? "#fff" : "rgba(255,255,255,0.35)"}
              strokeWidth={active ? 1.5 : 1}
              style={{
                cursor: "pointer",
                filter: active ? `drop-shadow(0 0 6px ${fill})` : "none",
                transition: "all 0.25s ease",
              }}
              onClick={() => onSelect(i)}
            >
              <title>{c.name}</title>
            </circle>
          );
        })}

        {/* Hub / Cycle-Toggle */}
        <circle
          cx={center}
          cy={center}
          r={6}
          fill={cycleColors ? "#00d2ff" : "rgba(255,255,255,0.12)"}
          stroke={cycleColors ? "#fff" : "rgba(255,255,255,0.3)"}
          strokeWidth={1}
          style={{
            cursor: "pointer",
            filter: cycleColors
              ? "drop-shadow(0 0 6px rgba(0,210,255,0.9))"
              : "none",
            transition: "all 0.25s ease",
          }}
          onClick={onToggleCycle}
        >
          <title>Cycle {cycleColors ? "ausschalten" : "einschalten"}</title>
        </circle>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Custom Slider (ersetzt native OS-Slider)
───────────────────────────────────────────── */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={labelStyle}>
      <span style={valueLabel}>
        {label}: {value.toFixed(step < 1 ? 2 : 0)}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="dp-slider"
        style={{ ["--dp-pct" as any]: `${pct}%` }}
      />
    </div>
  );
}

export default function ControlPanel({
  state,
  sync,
  burstRef,
  panelOpen,
  onTogglePanel,
}: ControlPanelProps) {
  const {
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
  } = state;

  const [hoverToggle, setHoverToggle] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        @keyframes dp-dial-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dp-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 108px;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(to right, #00d2ff var(--dp-pct), rgba(255,255,255,0.12) var(--dp-pct));
          outline: none;
          cursor: pointer;
        }
        .dp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d2ff;
          box-shadow: 0 0 8px rgba(0,210,255,0.85);
          cursor: pointer;
          margin-top: -5px;
        }
        .dp-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 50%;
          background: #00d2ff;
          box-shadow: 0 0 8px rgba(0,210,255,0.85);
          cursor: pointer;
        }
        .dp-slider::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
        }
        .dp-slider::-moz-range-progress {
          height: 4px;
          border-radius: 999px;
          background: #00d2ff;
        }

        .dp-panel {
          scrollbar-width: thin;
          scrollbar-color: rgba(0,210,255,0.35) transparent;
        }
        .dp-panel::-webkit-scrollbar {
          width: 6px;
        }
        .dp-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .dp-panel::-webkit-scrollbar-thumb {
          background: rgba(0,210,255,0.35);
          border-radius: 999px;
        }
        .dp-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(0,210,255,0.55);
        }
      `}</style>

      {/* Toggle Button */}
      <button
        onClick={onTogglePanel}
        onMouseEnter={() => setHoverToggle(true)}
        onMouseLeave={() => setHoverToggle(false)}
        title={panelOpen ? "Hide controls" : "Show controls"}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 20,
          width: 34,
          height: 34,
          borderRadius: 10,
          background:
            panelOpen || hoverToggle
              ? "rgba(0,180,255,0.14)"
              : "rgba(10,14,20,0.6)",
          border: `1px solid ${panelOpen || hoverToggle ? "rgba(0,210,255,0.45)" : "rgba(255,255,255,0.1)"}`,
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s ease, border-color 0.2s ease",
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
              stroke="rgba(0,210,255,0.85)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* Control Panel */}
      <div
        className="dp-panel"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 12,
          background: "rgba(8,12,18,0.68)",
          backdropFilter: "blur(14px)",
          borderRadius: 16,
          border: "1px solid rgba(0,210,255,0.14)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          minWidth: 268,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          userSelect: "none",
          opacity: panelOpen ? 1 : 0,
          pointerEvents: panelOpen ? "auto" : "none",
          transform: panelOpen ? "translateY(0px)" : "translateY(-6px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          paddingTop: 54,
          paddingBottom: 18,
          paddingLeft: 18,
          paddingRight: 18,
        }}
      >
        {/* GEOMETRY */}
        <div style={sectionLabel}>Geometry</div>
        <Slider
          label="Rows"
          value={rows}
          min={2}
          max={20}
          step={1}
          onChange={(v) => sync("rows", v)}
        />
        <Slider
          label="Cols"
          value={cols}
          min={4}
          max={40}
          step={1}
          onChange={(v) => sync("cols", v)}
        />
        <Slider
          label="Spread"
          value={spread}
          min={0.2}
          max={4.0}
          step={0.05}
          onChange={(v) => sync("spread", v)}
        />

        <div style={divider} />

        {/* SHAPE */}
        <div style={sectionLabel}>Shape</div>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
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

        <div style={divider} />

        {/* DISTRIBUTION */}
        <div style={sectionLabel}>Distribution</div>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}
        >
          {DISTRIBUTION_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              style={distribution === key ? btnActive : btnInactive}
              onClick={() => sync("distribution", key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={divider} />

        {/* MODES */}
        <div style={sectionLabel}>Modes</div>
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: organicMode ? 10 : 4,
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
        {organicMode && (
          <Slider
            label="Intensity"
            value={organicIntensity}
            min={0.0}
            max={3.0}
            step={0.05}
            onChange={(v) => sync("organicIntensity", v)}
          />
        )}

        <div style={divider} />

        {/* ROTATION */}
        <div style={sectionLabel}>Rotation</div>
        <div
          style={{ display: "flex", gap: 7, marginBottom: autoRotate ? 10 : 4 }}
        >
          <button
            style={autoRotate ? btnActive : btnInactive}
            onClick={() => sync("autoRotate", !autoRotate)}
          >
            ↻ Auto-Rotate
          </button>
        </div>
        {autoRotate && (
          <Slider
            label="Speed"
            value={rotateSpeed}
            min={0.05}
            max={3.0}
            step={0.05}
            onChange={(v) => sync("rotateSpeed", v)}
          />
        )}

        <div style={divider} />

        {/* SPIRAL DRIFT */}
        <div style={sectionLabel}>Spiral Drift</div>
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: spiralDrift ? 10 : 4,
          }}
        >
          <button
            style={spiralDrift ? btnActive : btnInactive}
            onClick={() => sync("spiralDrift", !spiralDrift)}
          >
            ⟳ Spiral Drift
          </button>
        </div>
        {spiralDrift && (
          <Slider
            label="Speed"
            value={spiralSpeed}
            min={0.1}
            max={5.0}
            step={0.1}
            onChange={(v) => sync("spiralSpeed", v)}
          />
        )}

        <div style={divider} />

        {/* EXPLODE / IMPLODE */}
        <div style={sectionLabel}>Explode</div>
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: explodePulse ? 10 : 4,
          }}
        >
          <button
            style={btnInactive}
            onClick={() => {
              burstRef.current = true;
            }}
          >
            ✦ Burst
          </button>
          <button
            style={explodePulse ? btnActive : btnInactive}
            onClick={() => sync("explodePulse", !explodePulse)}
          >
            ◎ Pulse
          </button>
        </div>
        {explodePulse && (
          <Slider
            label="Speed"
            value={explodeSpeed}
            min={0.2}
            max={4.0}
            step={0.1}
            onChange={(v) => sync("explodeSpeed", v)}
          />
        )}

        <div style={divider} />

        {/* COLOR — Radialer Dial statt Button-Reihe */}
        <div style={{ ...sectionLabel, textAlign: "center" }}>Color</div>
        <ColorDial
          colorIndex={colorIndex}
          cycleColors={cycleColors}
          onSelect={(i) => {
            sync("cycleColors", false);
            sync("colorIndex", i);
          }}
          onToggleCycle={() => sync("cycleColors", !cycleColors)}
        />
        <div
          style={{
            textAlign: "center",
            fontSize: 10.5,
            color: "rgba(255,255,255,0.4)",
            marginTop: 4,
          }}
        >
          {cycleColors ? "Cycle aktiv" : COLOR_PRESETS[colorIndex].name}
        </div>
      </div>
    </>
  );
}
