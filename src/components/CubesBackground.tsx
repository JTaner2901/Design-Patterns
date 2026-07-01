import Cubes from "./Cubes";

/* ─────────────────────────────────────────────
   CubesBackground
   Fertiger Hintergrund-Layer für eine Section.

   Verwendung in einer Section (z. B. CTASection.tsx):

   <section style={{ position: "relative", overflow: "hidden", ...restlicher Style }}>
     <CubesBackground />
     <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
       {... Titel, Text etc. — reine Textelemente lassen die Maus
            "durch" zum Cube-Grid darunter ...}
       <Link style={{ pointerEvents: "auto" }}>Zum Projekt</Link>
       {... jedes klickbare Element braucht pointerEvents:"auto" ...}
     </div>
   </section>

   Wichtig: OHNE pointerEvents:"none" auf dem Text-Wrapper fängt der
   Content alle Mausbewegungen ab, bevor sie das Cube-Grid erreichen —
   die Würfel würden dann nur dort reagieren, wo kein Text drüber liegt.
───────────────────────────────────────────── */

export default function CubesBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.5,
        maskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
      }}
    >
      <Cubes
        gridSize={12}
        maxAngle={35}
        radius={2.5}
        borderStyle="1px solid rgba(0,210,255,0.3)"
        faceColor="rgba(0,12,24,0.5)"
        rippleColor="rgba(0,210,255,0.9)"
        rippleOnClick
        autoAnimate
        rippleSpeed={1.6}
      />
    </div>
  );
}
