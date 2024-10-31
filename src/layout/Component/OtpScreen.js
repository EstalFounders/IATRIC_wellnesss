import Image from "next/image";
import styles from "../css/labTestLoginModel.module.css";
import { useRef, useEffect } from "react";

export const OtpScreen = ({ onClose, handleSubmitOtp }) => {
  const inputRefs = useRef([]);

  // Function to handle input change
  const handleChange = (e, index) => {
    if (e.target.value.length === 1 && index < inputRefs.current.length - 1) {
      // Move focus to the next input if a digit is entered and it's not the last input
      inputRefs.current[index + 1].focus();
    }
  };

  // Function to handle key down for backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (e.target.value === "" && index > 0) {
        // Move focus to the previous input if backspace is pressed and input is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmitOTP = () => {
    handleSubmitOtp();
  };

  return (
    <div className="row">
      {/* Image Column */}
      <div className="col-12 col-md-4 d-flex ml-2 align-items-center mb-4 mb-md-0">
        <Image
          src="/images/labtest/login/loginBg.png"
          width={228}
          height={547}
          className="img-fluid d-none d-md-block" // Hide image on small screens, show on medium+
          alt="Login Background"
        />
      </div>

      {/* Form Column */}
      <div className="col-12 col-md-6 d-flex flex-column align-items-start mt-5">
        <div className={`mt-3 ${styles.requestOtptext}`}>OTP</div>
        <div className={`mt-2 ${styles.getaccesstext}`}>Enter OTP</div>

        <div className="w-100 mt-5">
          <div className="d-flex justify-content-center">
            {/* Wrapper div for OTP inputs */}
            <div className="d-flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={styles.otpInput}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`mt-3 w-100 clickable-div ${styles.requestOtpBtn}`}
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
