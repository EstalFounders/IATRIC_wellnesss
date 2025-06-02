import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const OtpConfirmationPopup = ({ mobile, onConfirm }) => {
  // Refs and state for OTP input
  console.log("Mobile number:", mobile);

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: newOtp }),
      });
      const data = await res.json();
      console.log("OTP sent response:", data);
    } catch (error) {
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
    const temp_code = 123456; // Temporary code for testing
    if (enteredCode === temp_code.toString()) {
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
            width={150}
            height={150}
          />
        </div>

        {/* Heading */}
        <div className="text-center text-primary mb-2 h1">
          Verification Code
        </div>
        <div className="text-sm text-center text-gray-600 mb-3">
          We have sent you code on your whatsApp
        </div>

        {/* OTP Inputs */}
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
              className="mx-1"
              style={{ width: "30px", height: "50px", fontSize: "22px" }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-sm text-gray-500 mb-4">
          Didn’t receive code?{" "}
          <button
            className={`font-semibold ${
              resendCooldown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
            onClick={generateAndSendOtp}
            disabled={resendCooldown > 0}
          >
            Resend{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
          </button>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button onClick={handleSubmit} className="btn btn-primary mb-4">
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpConfirmationPopup;
