import Image from "next/image";
import styles from "../css/labTestLoginModel.module.css";
import { useState } from "react";
import { isMobileValid } from "../../components/labTestComponent/common/CommonMethod";

export const RequestOtp = ({ onClose, handleOtpRequest }) => {
  const [mobNo, setMobNo] = useState();
  const [error, setError] = useState();

  const handleOnChange = (e) => {
    setError();
    setMobNo(e.target.value);
  };

  const handlOTPrequest = () => {
    if (!isMobileValid(mobNo)) {
      // Handle invalid input, e.g., show an error message or return early
      setError("Please enter a 10-digit number.");
      return;
    }

    handleOtpRequest(mobNo);
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
        <div className={`mt-3 ${styles.requestOtptext}`}>Login</div>
        <div className={`mt-2 ${styles.getaccesstext}`}>
          Get access to your reports
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter your Mobile No"
            className={`mt-4 ${styles.mobilenumberinput}`}
            onChange={handleOnChange}
          />
        </div>

        <div
          className={`mt-3 clickable-div ${styles.requestOtpBtn}`}
          onClick={handlOTPrequest}
        >
          Request OTP
        </div>
        <div className="text-danger mt-2">{error ? error : ""}</div>
      </div>

      {/* Close Button */}
      <div
        className="col-12 col-md-1 text-right d-flex align-items-start mt-2 mt-md-0 ml-5"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      >
        <span className="mt-2">×</span>
      </div>
    </div>
  );
};
