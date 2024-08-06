import { useState } from "react";
import { useRouter } from "next/router";
import { loginDoctor } from "../../helper";
import Preloader from "../Preloader";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Image from "next/image";
import Logo from "../../../public/images/logo.png";
// import GoogleSvg from "../assets/icons8-google.svg";
import ImageSrc from "../../../public/images/Doctor/doctor-removebg-preview.png"; // Adjust the path as necessary
import styles from "./css/DoctorLogin.module.css"; // Import the CSS file
import CustomDialog from "../CustomPopup";

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

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setShowDialog(true);
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
    <div className={`${styles.container} p-4`}>
      <div className={styles["login-main"]}>
        <div className={styles["login-left"]}>
          <Image src={ImageSrc} alt="Login Image" />
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
                  <a href="#" className={styles["forgot-pass-link"]}>
                    Forgot password?
                  </a>
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
      {/* {error && <p className={styles["error-message"]}>{error}</p>} */}
    </div>
  );
}
