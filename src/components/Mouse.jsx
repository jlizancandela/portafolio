import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

const Mouse = () => {
  const mouseRef = useRef(null);

  useEffect(() => {
    const el = mouseRef.current;
    if (!el) return;

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      el.style.left = `${clientX}px`;
      el.style.top = `${clientY}px`;
    };

    // escuchamos el movimiento en toda la ventana
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={mouseRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "60px",
        height: "60px",
        backgroundColor: "rgba(162, 0, 255, 0.45)",
        boxShadow: "0 0 80px 30px rgba(162, 0, 255, 0.45)",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)", // centrado respecto al cursor
        pointerEvents: "none", // que no bloquee clics
        zIndex: 9999,
      }}
    />
  );
};

export default Mouse;
