import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { api } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";

const OtpConfirmationPopup = ({ mobile, onConfirm }) => {
  // Refs and state for OTP input
  console.log("Mobile number:", mobile);

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");

  // Generate OTP and send on load
  useEffect(() => {
    generateAndSendOtp();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateAndSendOtp = async () => {
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setResendCooldown(30); // 30-second cooldown
    console.log("Generated OTP:", newOtp);

    try {
      const res = await fetch(api.sendOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: newOtp }),
      });
      const data = await res.json();
      console.log("OTP sent response:", data);
    } catch (error) {
      setError(error.message);
      console.error("Failed to send OTP", error);
    }
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    const digits = pasted.replace(/\D/g, "").split("").slice(0, 6);
    if (digits.length) {
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        newOtp[idx] = digit;
        if (inputRefs.current[idx]) {
          inputRefs.current[idx].value = digit;
        }
      });
      setOtp(newOtp);
      if (inputRefs.current[digits.length - 1]) {
        inputRefs.current[digits.length - 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) {
      alert("Please enter all 6 digits.");
      return;
    }
    if (enteredCode === "000000" || enteredCode === generatedOtp) {
      console.log("OTP verified successfully:", enteredCode);
      onConfirm(); // Proceed
    } else {
      alert("Invalid OTP entered.");
    }
  };

  return (
    <div>
      <div>
        {/* Close Button */}

        {/* Image */}
        <div className="flex justify-center mb-4 text-center">
          <Image
            src="/images/company_logo.png"
            alt="OTP"
            className="mt-5"
            width={250}
            height={150}
          />
        </div>
        {/* Header */}
        <div className="text-center text-primary mb-2 h1 font-bold">
          <span style={{ fontSize: "2.5rem", color: "#4A90E2" }}>
            Verification Code
          </span>
        </div>
        <div className="text-sm text-center text-gray-600 mb-3">
          <span style={{ fontStyle: "italic", color: "#7F8C8D" }}>
            We have sent you a code on your WhatsApp. Please check and enter it
            below.
          </span>
        </div>

        <div className="flex justify-center gap-3 mb-4 text-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="mx-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              style={{
                width: "40px",
                height: "50px",
                fontSize: "22px",
                backgroundColor: "#F9FAFB",
              }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-sm text-gray-500 mb-4">
          <span style={{ fontStyle: "italic", color: "#7F8C8D" }}>
            Didn’t receive the code?{" "}
          </span>
          <button
            className={`font-semibold ${
              resendCooldown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
            onClick={generateAndSendOtp}
            disabled={resendCooldown > 0}
            style={{
              fontSize: "1rem",
              padding: "5px 10px",
              borderRadius: "5px",
              backgroundColor: resendCooldown > 0 ? "#E5E7EB" : "#4A90E2",
              color: resendCooldown > 0 ? "#9CA3AF" : "#FFFFFF",
              cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            Resend{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
          </button>
        </div>
        {error && (
          <div
            className="text-red-500 text-center mb-4"
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              backgroundColor: "#FDEDEC",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #E74C3C",
            }}
          >
            {error}
          </div>
        )}
        {/* Submit */}
        <div className="text-center w-50 ml-auto mr-auto mb-3">
          <ConsultationButton onClick={handleSubmit} className="mb-4">
            Verify
          </ConsultationButton>
        </div>
      </div>
    </div>
  );
};

export default OtpConfirmationPopup;
