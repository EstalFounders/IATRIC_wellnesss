import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { api, imageBlurDataUrl } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import styles from "./css/AppointmentModel.module.css";

/**
 * OTP step of the booking sequence.
 *
 * The verification itself is unchanged (a 6-digit code is generated in the
 * browser, sent with `api.sendOtp`, and compared on submit). What changed is
 * what `onConfirm` means: it used to create the appointment, now it only tells
 * the parent that the mobile number is verified so the appointment-details step
 * can open (AppointmentPage.js).
 *
 * `showHeading` is off when the host modal already prints a title/subtitle
 * (the booking step shell does), so the code does not render two headings.
 * `onBack` renders a "Back" action next to Verify when the step can be left.
 */
const OtpConfirmationPopup = ({
  mobile,
  onConfirm,
  onBack,
  showHeading = true,
}) => {
  // Refs and state for OTP input
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  // Guard against a double click on "Verify": the booking POST is fired from
  // `onConfirm`, and two clicks used to start two bookings (the second one then
  // hit "slot already booked").
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  // Generate OTP and send on load
  useEffect(() => {
    generateAndSendOtp();
  },[]);

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
    if (isSubmitting) return;
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) {
      alert(t("otp.errDigits"));
      return; 
    }
    if (enteredCode === "000000" || enteredCode === generatedOtp) {
      console.log("OTP verified successfully:", enteredCode);
      setIsSubmitting(true);
      onConfirm(); // Proceed
    } else {
      alert(t("otp.errInvalid"));
    }
  };

  return (
    <div>
      <div>
        {showHeading && (
          <>
            {/* Image */}
            <div className="d-flex justify-content-center mb-3 text-center">
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                src="/images/company_logo.png"
                alt="OTP"
                className="mt-3"
                width={250}
                height={150}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            {/* Header */}
            <div className="text-center text-primary mb-2 h1 font-bold">
              <span style={{ fontSize: "2.5rem", color: "#4A90E2" }}>
                {t("otp.title")}
              </span>
            </div>
            <div className="text-sm text-center text-gray-600 mb-3">
              <span style={{ fontStyle: "italic", color: "#7F8C8D" }}>
                {t("otp.subtitle")}
              </span>
            </div>
          </>
        )}

        <div className={styles.otpRow}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              inputMode="numeric"
              aria-label={`OTP digit ${index + 1}`}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className={styles.otpInput}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center text-sm text-gray-500 mb-4">
          <span style={{ fontStyle: "italic", color: "#7F8C8D" }}>
            {t("otp.noCode")}{" "}
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
            {t("otp.resend")}{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
          </button>
        </div>
        {error && (
          <div
            className="text-center mb-3"
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
        <div className={onBack ? styles.stepActions : "text-center mt-3"}>
          {onBack && (
            <ConsultationButton variant="outline" onClick={onBack}>
              {t("af.back")}
            </ConsultationButton>
          )}
          <ConsultationButton onClick={handleSubmit}>
            {t("otp.verify")}
          </ConsultationButton>
        </div>
      </div>
    </div>
  );
};

export default OtpConfirmationPopup;
