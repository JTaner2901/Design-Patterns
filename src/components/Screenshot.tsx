import { useRef, useState } from "react";

type ScreenshotProps = {
  targetRef?: React.RefObject<HTMLElement>;
};

export default function Screenshot({ targetRef }: ScreenshotProps) {
  const [capturing, setCapturing] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleScreenshot = () => {
    setCapturing(true);
    if (btnRef.current) btnRef.current.style.opacity = "0";

    try {
      // Find the p5 WebGL canvas directly inside the container
      const container = targetRef?.current ?? document.body;
      const canvas = container.querySelector(
        "canvas",
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        console.error("Kein Canvas gefunden");
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `screenshot-${Date.now()}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        },
        "image/jpeg",
        0.95,
      );
    } catch (e) {
      console.error("Screenshot fehlgeschlagen:", e);
    } finally {
      setTimeout(() => {
        if (btnRef.current) btnRef.current.style.opacity = "1";
        setCapturing(false);
      }, 300);
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleScreenshot}
      disabled={capturing}
      title="Screenshot aufnehmen"
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 20,
        width: 32,
        height: 32,
        background: capturing ? "rgba(0,180,255,0.3)" : "rgba(0,0,0,0.55)",
        border: `1px solid ${capturing ? "rgba(0,210,255,0.8)" : "rgba(255,255,255,0.12)"}`,
        backdropFilter: "blur(6px)",
        cursor: capturing ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s, border-color 0.2s, opacity 0.15s",
        padding: 0,
      }}
    >
      {capturing ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ animation: "spin 0.8s linear infinite" }}
        >
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="rgba(0,210,255,0.9)"
            strokeWidth="1.5"
            strokeDasharray="20 10"
            strokeLinecap="round"
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect
            x="1"
            y="4"
            width="14"
            height="10"
            rx="1.5"
            stroke="rgba(0,210,255,0.8)"
            strokeWidth="1.2"
          />
          <circle
            cx="8"
            cy="9"
            r="2.5"
            stroke="rgba(0,210,255,0.8)"
            strokeWidth="1.2"
          />
          <path
            d="M5.5 4L6.5 2h3l1 2"
            stroke="rgba(0,210,255,0.8)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
