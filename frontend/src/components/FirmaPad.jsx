import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

export default function FirmaPad({ onSave, firmaInicial }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);

      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = 170 * ratio;

      const ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);

      signaturePadRef.current = new SignaturePad(canvas, {
        penColor: "black",
        minWidth: 1,
        maxWidth: 3,
      });
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {

    if (!firmaInicial) return;

    const timer = setTimeout(() => {

      try {

        if (signaturePadRef.current) {

          signaturePadRef.current.clear();

          signaturePadRef.current.fromDataURL(
            firmaInicial
          );

        }

      } catch (err) {

        console.error(
          "Error cargando firma:",
          err
        );

      }

    }, 200);

    return () => clearTimeout(timer);

  }, [firmaInicial]);

  const limpiar = () => {
    signaturePadRef.current?.clear();
  };

  const guardar = () => {
    if (
      !signaturePadRef.current ||
      signaturePadRef.current.isEmpty()
    ) {
      alert("Debe firmar primero");
      return;
    }

    const firma =
      signaturePadRef.current.toDataURL("image/png");

    onSave(firma);
  };

  return (
    <div className="w-full">
      <div
        className="
          border
          rounded-xl
          overflow-hidden
          bg-white
        "
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "170px",
            cursor: "crosshair",
          }}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={limpiar}
          className="
            bg-gray-500
            hover:bg-gray-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          Limpiar
        </button>

        <button
          type="button"
          onClick={guardar}
          className="
            bg-green-500
            hover:bg-green-600
            text-white
            px-4
            py-2
            rounded-lg
          "
        >
          Guardar Firma
        </button>
      </div>
    </div>
  );
}