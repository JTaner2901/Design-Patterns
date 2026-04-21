// npm install p5 @types/p5
import { useEffect, useRef } from "react";
import p5 from "p5";

export default function DesignPattern() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        // Liest die aktuelle Breite und Höhe des Div-Containers aus
        const width = containerRef.current?.offsetWidth || 710;
        const height = containerRef.current?.offsetHeight || 400;
        
        p.createCanvas(width, height, p.WEBGL);
        p.angleMode(p.DEGREES);
        p.strokeWeight(2);
        p.noFill();
        p.stroke(32, 8, 64);
      };

      p.draw = () => {
        p.background(250, 180, 200);
        p.orbitControl();
        p.rotateY(p.frameCount * 0.2);

        for (let zAngle = 0; zAngle < 180; zAngle += 30) {
          for (let xAngle = 0; xAngle < 360; xAngle += 30) {
            p.push();
            p.rotateZ(zAngle);
            p.rotateX(xAngle);
            
            // Damit das Muster zentriert bleibt, nutzen wir die halbe Canvas-Höhe als Radius
            p.translate(0, p.height / 2.5, 0);
            
            p.box(30); 
            p.pop();
          }
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          // Passt die Canvas bei Fensteränderung an Breite UND Höhe an
          p.resizeCanvas(
            containerRef.current.offsetWidth, 
            containerRef.current.offsetHeight
          );
        }
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        height: "100%", // Hier kannst du die Höhe definieren (z.B. 80% der Viewport-Höhe)
        overflow: "hidden" 
      }} 
    />
  );
}