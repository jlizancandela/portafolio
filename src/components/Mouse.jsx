import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

const Mouse = () => {
  const haloRef = useRef(null);
  const crossRef = useRef(null);

  useEffect(() => {
    const halo = haloRef.current;
    const cross = crossRef.current;
    if (!halo || !cross) return;

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      halo.style.left = `${clientX}px`;
      halo.style.top = `${clientY}px`;
      cross.style.left = `${clientX}px`;
      cross.style.top = `${clientY}px`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Halo con blur */}
      <div
        ref={haloRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9998,
          background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(168,85,247,0) 70%)",
          filter: "blur(8px)",
        }}
      />
      {/* Crosshair */}
      <div
        ref={crossRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <line x1="16" y1="2" x2="16" y2="10" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="22" x2="16" y2="30" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="16" x2="10" y2="16" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2.5" fill="rgba(255,255,255,1)" />
        </svg>
      </div>
    </>
  );
};

export default Mouse;
