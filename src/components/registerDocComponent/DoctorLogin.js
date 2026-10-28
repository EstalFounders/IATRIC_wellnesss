import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/router";
import { loginDoctor } from "../../helper";
import Preloader from "../Preloader";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Image from "next/image";
import Logo from "../../../public/images/logo.png";
import CompanyLogo from "../../../public/images/company_logo.png";
// import GoogleSvg from "../assets/icons8-google.svg";
import styles from "./css/DoctorLogin.module.css"; // Import the CSS file
import CustomDialog from "../CustomPopup";
import { api } from "../../constant";

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState(
    ""
  );
  // Forgot-password flow state: mobile -> otp -> reset.
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setShowDialog(true);
  };

  const openForgotPassword = () => {
    setForgotStep("mobile");
    setMobile("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    if (forgotLoading) return;
    setShowForgotPassword(false);
  };

  const forgotApiCall = async (payload) => {
    const res = await fetch(api.doctorForgotPassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const handleRequestOtp = async () => {
    setForgotError("");
    setForgotLoading(true);
    try {
      const data = await forgotApiCall({ action: "request-otp", mobile });
      if (data.success) {
        setForgotStep("otp");
      } else {
        setForgotError(data.error || "Unable to send OTP");
      }
    } catch (error) {
      console.error(error);
      setForgotError("An error occurred. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError("");
    setForgotLoading(true);
    try {
      const data = await forgotApiCall({ action: "verify-otp", mobile, otp });
      if (data.success) {
        setForgotStep("reset");
      } else {
        setForgotError(data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      setForgotError("An error occurred. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError("");
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    setForgotLoading(true);
    try {
      const data = await forgotApiCall({ action: "reset-password", mobile, newPassword });
      if (data.success) {
        setShowForgotPassword(false);
        setForgotStep("mobile");
        setMobile("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        handleShowDialog("Password reset successfully. Please log in with your new password.");
      } else {
        setForgotError(data.error || "Unable to reset password");
      }
    } catch (error) {
      console.error(error);
      setForgotError("An error occurred. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setError("");

    try {
      const res = await loginDoctor({ email, password });
      if (res.ok) {
        router.push("/registerDoc/homepage");
      } else {
        // console.log(res.status, 'error message')
        setError(res.error);
        handleShowDialog("Wrong Input, Please try again with the correct credentials");
        setEmail("")
        setPassword("")
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="p-4">
      <div className={styles["login-main"]}>
        <div className={styles["login-left"]}>
          <Image
            src={CompanyLogo}
            alt="HealthPath - Your path to healthy living"
            priority
          />
        </div>
        <div className={styles["login-right"]}>
          <div className={styles["form-container"]}>
            <div className={styles["login-logo"]}>
              <Image src={Logo} alt="Logo" />
            </div>
            <div className={styles["login-center"]}>
              <h2>Welcome back!</h2>
              <h6>Please enter your details</h6>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
                <div className={styles["pass-input-div"]}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                  {showPassword ? (
                    <FaEyeSlash
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles["pass-input-icon"]}
                    />
                  ) : (
                    <FaEye
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles["pass-input-icon"]}
                    />
                  )}
                </div>
                <div className={styles["login-center-options"]}>
                  <button
                    type="button"
                    className={styles["forgot-pass-link"]}
                    onClick={openForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <button type="submit" className={styles.button}>
                  Log In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {loading && <Preloader />}
      <CustomDialog
        show={showDialog}
        handleClose={handleCloseDialog}
        message={message}
      />

      <Modal show={showForgotPassword} onHide={closeForgotPassword} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {forgotStep === "reset" ? "Set New Password" : "Reset Password"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {forgotStep === "mobile" && (
            <div className={styles["forgot-form"]}>
              <p className={styles["forgot-hint"]}>
                Enter your registered mobile number and we will send an OTP.
              </p>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={styles["forgot-input"]}
              />
              {forgotError && (
                <p className={styles["forgot-error"]}>{forgotError}</p>
              )}
              <button
                type="button"
                className={styles["forgot-button"]}
                onClick={handleRequestOtp}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          )}

          {forgotStep === "otp" && (
            <div className={styles["forgot-form"]}>
              <p className={styles["forgot-hint"]}>
                Enter the OTP sent to your mobile number.
              </p>
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles["forgot-input"]}
                maxLength={6}
              />
              {forgotError && (
                <p className={styles["forgot-error"]}>{forgotError}</p>
              )}
              <button
                type="button"
                className={styles["forgot-button"]}
                onClick={handleVerifyOtp}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {forgotStep === "reset" && (
            <div className={styles["forgot-form"]}>
              <p className={styles["forgot-hint"]}>Set your new password.</p>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles["forgot-input"]}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles["forgot-input"]}
              />
              {forgotError && (
                <p className={styles["forgot-error"]}>{forgotError}</p>
              )}
              <button
                type="button"
                className={styles["forgot-button"]}
                onClick={handleResetPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
      {/* {error && <p className={styles["error-message"]}>{error}</p>} */}
    </div>
  );
}
