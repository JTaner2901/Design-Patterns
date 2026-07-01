import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { UISettings } from "./DesignPattern";

interface CutsceneProps {
  sync: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void;
  burstRef: MutableRefObject<boolean>;
  zoomTargetRef: MutableRefObject<number | null>;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
}

/* ─────────────────────────────────────────────
   CutsceneAudio — synthetisierter Score, kein Audio-File.

   Aufbau, bewusst "cinematic" statt brummig:
   - Sub  (Sine)      → sauberes, tiefes Fundament, kein Filter nötig
   - Pad  (2× Triangle, leicht verstimmt) → warmer Körper, läuft durch
     einen Tiefpass, dessen Cutoff LANGSAM "atmet" (LFO auf Filter,
     nicht auf Lautstärke — das war der Bzzz-Effekt vorher)
   - Shimmer (1× Sawtooth, stark gefiltert) → nur bei hoher Tension
     hörbar, sorgt fürs "episch werdende" Schimmern im Finale
   - Reverb (Convolver mit synthetischem Impulse) → gibt Pad + Shimmer
     Raumtiefe, damit es nach Score statt nach Sinuston klingt
───────────────────────────────────────────── */

function createReverbImpulse(ctx: AudioContext, duration = 2.8, decay = 2.2) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

class CutsceneAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;

  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;

  private shimmerOsc: OscillatorNode | null = null;
  private shimmerGain: GainNode | null = null;
  private shimmerFilter: BiquadFilterNode | null = null;

  private breatheLfo: OscillatorNode | null = null;
  private breatheLfoGain: GainNode | null = null;

  private reverbSend: GainNode | null = null;

  start() {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      this.master = master;

      // ── Reverb-Send (gemeinsamer Hall für Pad + Shimmer) ──
      const convolver = ctx.createConvolver();
      convolver.buffer = createReverbImpulse(ctx);
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.35;
      reverbSend.connect(convolver);
      convolver.connect(master);
      this.reverbSend = reverbSend;

      // ── Sub (sauberes Fundament, trocken, kein Filter) ──
      const subGain = ctx.createGain();
      subGain.gain.value = 0.5;
      subGain.connect(master);
      const subOsc = ctx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.value = 41; // E1-ish
      subOsc.connect(subGain);
      subOsc.start();
      this.subOsc = subOsc;
      this.subGain = subGain;

      // ── Pad (warmer Körper, Triangle statt Sägezahn) ──
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 420;
      padFilter.Q.value = 0.4;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.32;
      padGain.connect(padFilter);
      padFilter.connect(master);
      padFilter.connect(reverbSend);

      const padOsc1 = ctx.createOscillator();
      padOsc1.type = "triangle";
      padOsc1.frequency.value = 82; // eine Oktave über dem Sub
      padOsc1.connect(padGain);

      const padOsc2 = ctx.createOscillator();
      padOsc2.type = "triangle";
      padOsc2.frequency.value = 82 * 1.004; // ganz leicht verstimmt, für Schwebung statt Bzzz
      padOsc2.connect(padGain);

      padOsc1.start();
      padOsc2.start();
      this.padOsc1 = padOsc1;
      this.padOsc2 = padOsc2;
      this.padGain = padGain;
      this.padFilter = padFilter;

      // ── Langsames "Atmen" auf dem Pad-Filter statt Lautstärke-Tremolo ──
      const breatheLfo = ctx.createOscillator();
      breatheLfo.frequency.value = 0.09;
      const breatheLfoGain = ctx.createGain();
      breatheLfoGain.gain.value = 180;
      breatheLfo.connect(breatheLfoGain);
      breatheLfoGain.connect(padFilter.frequency);
      breatheLfo.start();
      this.breatheLfo = breatheLfo;
      this.breatheLfoGain = breatheLfoGain;

      // ── Shimmer (nur bei hoher Tension hörbar) ──
      const shimmerFilter = ctx.createBiquadFilter();
      shimmerFilter.type = "bandpass";
      shimmerFilter.frequency.value = 1800;
      shimmerFilter.Q.value = 0.7;

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0; // startet stumm, kommt erst mit Tension
      shimmerGain.connect(shimmerFilter);
      shimmerFilter.connect(master);
      shimmerFilter.connect(reverbSend);

      const shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = "sawtooth";
      shimmerOsc.frequency.value = 164;
      shimmerOsc.connect(shimmerGain);
      shimmerOsc.start();
      this.shimmerOsc = shimmerOsc;
      this.shimmerGain = shimmerGain;
      this.shimmerFilter = shimmerFilter;

      // Langsamer, cinematischer Einschwing statt schnellem Fade
      const now = ctx.currentTime;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.5, now + 2.2);
    } catch {
      // Web Audio nicht verfügbar/blockiert — Cutscene läuft trotzdem stumm weiter
      this.ctx = null;
    }
  }

  /** level 0..1 — steuert Tonhöhe, Filter-Helligkeit, Shimmer-Lautstärke */
  setTension(level: number, rampTime = 1.8) {
    if (
      !this.ctx ||
      !this.subOsc ||
      !this.padOsc1 ||
      !this.padOsc2 ||
      !this.padFilter ||
      !this.shimmerOsc ||
      !this.shimmerGain
    )
      return;
    const now = this.ctx.currentTime;

    const subFreq = 41 + level * 14;
    this.subOsc.frequency.linearRampToValueAtTime(subFreq, now + rampTime);

    const padFreq = subFreq * 2;
    this.padOsc1.frequency.linearRampToValueAtTime(padFreq, now + rampTime);
    this.padOsc2.frequency.linearRampToValueAtTime(
      padFreq * 1.004,
      now + rampTime,
    );
    this.padFilter.frequency.linearRampToValueAtTime(
      420 + level * 1400,
      now + rampTime,
    );

    // Shimmer bleibt bei niedriger Tension praktisch stumm, kommt erst
    // ab der zweiten Hälfte deutlich rein — vermeidet frühes Bzzz-Gefühl
    const shimmerLevel = Math.max(0, level - 0.35) / 0.65;
    this.shimmerOsc.frequency.linearRampToValueAtTime(
      padFreq * 2,
      now + rampTime,
    );
    this.shimmerGain.gain.linearRampToValueAtTime(
      shimmerLevel * 0.09,
      now + rampTime,
    );
  }

  /** kurzer perkussiver Noise-Swell für die Burst-Momente, mit etwas Hall */
  hit() {
    if (!this.ctx || !this.master || !this.reverbSend) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = 0.8;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(500, now);
    bp.frequency.exponentialRampToValueAtTime(1600, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(this.master);
    gain.connect(this.reverbSend);
    noise.start(now);
    noise.stop(now + dur);
  }

  stop(fadeTime = 1.6) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const master = this.master;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + fadeTime);
    const { subOsc, padOsc1, padOsc2, shimmerOsc, breatheLfo } = this;
    setTimeout(
      () => {
        try {
          subOsc?.stop();
          padOsc1?.stop();
          padOsc2?.stop();
          shimmerOsc?.stop();
          breatheLfo?.stop();
          ctx.close();
        } catch {
          /* ignore */
        }
      },
      fadeTime * 1000 + 150,
    );
    this.ctx = null;
  }
}

/**
 * Wartet `ms` Millisekunden, bricht aber sofort ab (löst früher auf),
 * sobald `cancelledRef.current` true wird — dadurch "spult" ein Skip
 * einfach durch den Rest der Sequenz, statt hart abzubrechen, und die
 * finalen sync()-Aufrufe am Ende landen trotzdem sauber im End-Zustand.
 */
function wait(ms: number, cancelledRef: MutableRefObject<boolean>) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (cancelledRef.current || performance.now() - start >= ms) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export default function Cutscene({
  sync,
  burstRef,
  zoomTargetRef,
  setPanelOpen,
}: CutsceneProps) {
  const [playing, setPlaying] = useState(false);
  const cancelledRef = useRef(false);
  const audioRef = useRef<CutsceneAudio | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.stop(0.2);
    };
  }, []);

  const skip = () => {
    if (!playing) return;
    cancelledRef.current = true;
  };

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  const run = async () => {
    if (playing) return;
    cancelledRef.current = false;
    setPlaying(true);
    setPanelOpen(false);

    const audio = new CutsceneAudio();
    audio.start();
    audioRef.current = audio;

    // kurzer Moment für den Letterbox-Einzug, bevor's losgeht
    await wait(700, cancelledRef);

    // ── Phase 1: Grundform ──
    sync("distribution", "flat");
    sync("shapeKey", "box");
    sync("randomShapes", false);
    sync("organicMode", false);
    sync("spiralDrift", false);
    sync("explodePulse", false);
    sync("morphMode", true);
    sync("cycleColors", false);
    sync("colorIndex", 0);
    sync("autoRotate", false);
    sync("rows", 2);
    sync("cols", 4);
    sync("spread", 0.6);
    zoomTargetRef.current = 3200;
    audio.setTension(0.05, 1.2);
    await wait(4200, cancelledRef);

    // ── Phase 2: Wiederholung ──
    sync("distribution", "sphere");
    zoomTargetRef.current = 9000;
    audio.setTension(0.2, 1.3);
    sync("rows", 4);
    sync("cols", 6);
    await wait(1300, cancelledRef);
    audio.setTension(0.3, 1.3);
    sync("rows", 5);
    sync("cols", 8);
    await wait(1300, cancelledRef);
    audio.setTension(0.4, 1.6);
    sync("rows", 6);
    sync("cols", 10);
    await wait(1600, cancelledRef);

    // ── Phase 3: Transformation ──
    // Raster bleibt bei 6×10 (aus Phase 2 übernommen), Random Shapes
    // komplett raus: die mischt pro Zelle auch die teuersten Formen
    // (Star = 3 Boxen, Sphere = 32 eigene Vertices) über die ganze
    // Fläche. Formvielfalt kommt hier stattdessen nur aus den
    // sequenziellen shapeKey-Wechseln unten — einheitlich, planbar, leicht.
    sync("organicMode", true);
    sync("organicIntensity", 1.4);
    sync("spiralDrift", true);
    sync("spiralSpeed", 1.4);
    sync("cycleColors", true);
    audio.setTension(0.55, 1.8);
    await wait(1800, cancelledRef);
    sync("shapeKey", "sphere");
    audio.setTension(0.65, 1.5);
    await wait(1500, cancelledRef);
    sync("shapeKey", "torus");
    audio.setTension(0.75, 1.5);
    await wait(1500, cancelledRef);
    sync("shapeKey", "star");
    audio.setTension(0.85, 1.2);
    await wait(1200, cancelledRef);

    // ── Phase 4: Finale ──
    // Random Shapes (mischt u.a. Star/Sphere, die teuersten Formen)
    // und Organic Mode werden hier bewusst abgeschaltet — sonst
    // liefen mit dem größeren Raster + Burst + Explode zu viele
    // teure Effekte gleichzeitig. Burst/Zoom/Distribution tragen
    // das Finale auch so.
    sync("randomShapes", false);
    sync("organicMode", false);
    sync("shapeKey", "star");
    sync("distribution", "fibonacci");
    sync("rows", 14);
    sync("cols", 22);
    sync("autoRotate", true);
    sync("rotateSpeed", 2.0);
    sync("explodePulse", true);
    sync("explodeSpeed", 2.2);
    burstRef.current = true;
    zoomTargetRef.current = 60000;
    audio.setTension(1.0, 1.0);
    audio.hit();
    await wait(3200, cancelledRef);
    burstRef.current = true;
    audio.hit();
    await wait(2800, cancelledRef);

    // ── Ausklang: sanft in einen schönen Ruhezustand ──
    sync("explodePulse", false);
    sync("randomShapes", false);
    sync("shapeKey", "box");
    sync("distribution", "sphere");
    sync("rows", 6);
    sync("cols", 12);
    sync("spread", 1.0);
    sync("organicMode", false);
    sync("spiralDrift", false);
    sync("cycleColors", false);
    sync("colorIndex", 0);
    sync("morphMode", false);
    sync("autoRotate", true);
    sync("rotateSpeed", 0.3);
    zoomTargetRef.current = 9000;
    audio.setTension(0.1, 1.4);
    await wait(1400, cancelledRef);

    audio.stop(1.4);
    audioRef.current = null;
    zoomTargetRef.current = null;
    setPlaying(false);
    setPanelOpen(true);
  };

  return (
    <>
      {/* Trigger */}
      {!playing && (
        <button
          onClick={run}
          title="Cutscene abspielen"
          style={{
            position: "absolute",
            top: 64,
            right: 20,
            zIndex: 20,
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(10,14,20,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease, border-color 0.2s ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,180,255,0.14)";
            e.currentTarget.style.borderColor = "rgba(0,210,255,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(10,14,20,0.6)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2.5 1.5L11 6.5L2.5 11.5V1.5Z"
              fill="rgba(0,210,255,0.85)"
            />
          </svg>
        </button>
      )}

      {/* Click-to-skip Overlay */}
      {playing && (
        <div
          onClick={skip}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 25,
            cursor: "pointer",
          }}
        />
      )}

      {/* Letterbox */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: playing ? "9vh" : "0vh",
          background: "#000",
          zIndex: 30,
          pointerEvents: "none",
          transition: "height 0.8s cubic-bezier(0.65,0,0.35,1)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: playing ? "9vh" : "0vh",
          background: "#000",
          zIndex: 30,
          pointerEvents: "none",
          transition: "height 0.8s cubic-bezier(0.65,0,0.35,1)",
        }}
      />

      {/* Skip-Hinweis */}
      {playing && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(9vh + 14px)",
            right: 16,
            zIndex: 31,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "monospace",
            fontSize: 10,
            pointerEvents: "none",
          }}
        >
          klicken zum überspringen · esc
        </div>
      )}
    </>
  );
}
