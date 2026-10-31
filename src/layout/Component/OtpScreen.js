import Image from "next/image";
import styles from "../css/labTestLoginModel.module.css";
import { useRef, useEffect, useState } from "react";
import { api, imageBlurDataUrl } from "../../constant";

export const OtpScreen = ({ onClose, mobile, handleSubmitOtp }) => {
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

  // Function to handle input change
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

  const handleSubmitOTP = () => {
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) {
      alert("Please enter all 6 digits.");
      return;
    }
    if (enteredCode === generatedOtp) {
      console.log("OTP verified successfully:", enteredCode);
      handleSubmitOtp(); // Proceed
    } else {
      alert("Invalid OTP entered.");
    }
  };

  return (
    <div className="row">
      {/* Image Column */}
      <div className="col-12 col-md-4 d-flex ml-2 align-items-center mb-4 mb-md-0">
        <Image
          placeholder="blur"
          blurDataURL={imageBlurDataUrl}
          src="/images/labtest/login/loginBg.png"
          width={228}
          height={547}
          className="img-fluid d-none d-md-block" // Hide image on small screens, show on medium+
          alt="Login Background"
        />
      </div>

      {/* Form Column */}
      <div className="col-12 col-md-6 d-flex flex-column align-items-start mt-5">
        <div className={`mt-3 mr-auto ml-auto ${styles.requestOtptext}`}>OTP</div>
        <div className={`mt-2 mr-auto ml-auto ${styles.getaccesstext}`}>Enter OTP</div>

        <div className="w-100 mt-5 text-center">
          {/* OTP Input Boxes */}
          <div className="d-flex justify-content-center">
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
                  className="mx-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-center"
                  style={{
                    width: "40px",
                    height: "50px",
                    fontSize: "22px",
                    backgroundColor: "#F9FAFB",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Resend Section - Centered Below */}
          <div className="text-sm text-gray-500 mb-4 d-flex justify-content-center">
            <span
              style={{
                fontStyle: "italic",
                color: "#7F8C8D",
                marginRight: "8px",
              }}
            >
              Didn’t receive the code?
            </span>
            <button
              className={`font-semibold ${
                resendCooldown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:underline"
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

        <div
          className={`mt-3 clickable-div ${styles.requestOtpBtn}`}
          onClick={handleSubmitOTP}
        >
          Submit
        </div>
      </div>

      {/* Close Button */}
      <div
        className="col-12 col-md-1 text-right d-flex justify-content-end align-items-start mt-2 mt-md-0 ml-5 clickable-div"
        onClick={onClose}
      >
        <span className="mt-2">×</span>
      </div>
    </div>
  );
};
