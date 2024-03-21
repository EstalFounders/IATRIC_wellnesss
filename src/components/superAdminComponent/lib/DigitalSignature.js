import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

const DigitalSignature = ({ name, onSignatureChange }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const signaturePad = new SignaturePad(canvas);

    if (name) {
      signaturePad.fromDataURL(generateSignatureDataURL(name));
    }

    const handleEnd = () => {
      onSignatureChange(signaturePad.toDataURL());
    };

    canvas.addEventListener("mouseup", handleEnd);

    return () => {
      canvas.removeEventListener("mouseup", handleEnd);
    };
  }, [name, onSignatureChange]);

  const generateSignatureDataURL = (name) => {
    // Here you can implement a function to generate a signature from the name
    // For simplicity, this example just uses the name as text
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.font = "24px Arial";
    ctx.fillText(name, 10, 50);
    return canvas.toDataURL();
  };

  return <canvas ref={canvasRef} width="400" height="100"></canvas>;
};

export default DigitalSignature;
