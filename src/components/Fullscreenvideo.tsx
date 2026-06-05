import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function FullscreenVideo() {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "#000",
        zIndex: 99999,
        margin: 0,
        padding: 0,
      }}
    >
      <video
        src="/Motion.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>,
    document.body,
  );
}
