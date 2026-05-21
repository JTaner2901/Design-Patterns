import { useEffect, useState } from "react";

type Props = {
  getCanvas: () => HTMLCanvasElement | null;
};

export default function ScreenshotButton({ getCanvas }: Props) {
  const [flash, setFlash] = useState(false);

  const takeScreenshot = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    // Canvas -> Data URL
    const dataURL = canvas.toDataURL("image/png");

    // Download trigger
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `design-pattern-${Date.now()}.png`;
    link.click();

    // visual feedback
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  return (
    <button
      onClick={takeScreenshot}
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        padding: "6px 12px",
        fontFamily: "monospace",
        fontSize: 11,
        background: flash ? "#fff" : "#111",
        color: flash ? "#000" : "#fff",
        border: "1px solid #333",
        cursor: "pointer",
        transition: "0.15s",
        zIndex: 10,
      }}
    >
      ⬇ Screenshot
    </button>
  );
}
