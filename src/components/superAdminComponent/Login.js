import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { loginUser } from "../../helper";
import Preloader from "../Preloader";
import CustomDialog from "../CustomPopup";
import Logo from "../../../public/images/logo.png";
import CompanyLogo from "../../../public/images/company_logo.png";
import styles from "./css/SuperAdminLogin.module.css";

const BAD_CREDENTIALS_MESSAGE =
  "Wrong Input, Please try again with the correct credentials";

export default function Login() {
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const [loginErr, setLoginErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage("");
  };

  const loginDoc = async (event) => {
    // The form is a real <form>, so Enter submits. Stop the browser reload here.
    event.preventDefault();
    if (loader) return;

    const email = userInfo.email.trim();
    const password = userInfo.password;

    // Native `required` already blocks the empty case; this guard keeps the
    // handler safe if it is ever invoked directly.
    if (!email || !password) {
      setLoginErr("Please enter both your email and password.");
      return;
    }

    setLoader(true);
    setLoginErr("");

    try {
      // loginUser -> next-auth signIn(..., { redirect: false }): a wrong
      // credential pair resolves as { ok: false } instead of throwing.
      const loginRes = await loginUser({ email, password });

      setLoader(false);

      if (loginRes && !loginRes.ok) {
        setLoginErr("Please check your password & email");
        setDialogMessage(BAD_CREDENTIALS_MESSAGE);
        setShowDialog(true);
        setUserInfo((prev) => ({ ...prev, password: "" }));
      } else {
        router.push("/superAdmin/homepage");
      }
    } catch (error) {
      console.error("Error during super-admin sign-in:", error);
      setLoader(false);
      setLoginErr("An error occurred. Please try again later.");
    }
  };

  const invalid = Boolean(loginErr);

  return (
    <div className={styles["login-main"]}>
      <div className={styles["login-left"]}>
        {/* Sized off its container by the CSS module, so the emblem scales with
            the page instead of overflowing narrow viewports. */}
        <Image
          src={CompanyLogo}
          alt="HealthPath - your path to healthy living"
          priority
        />
      </div>

      <div className={styles["login-right"]}>
        <div className={styles["form-container"]}>
          <div className={styles["login-logo"]}>
            <Image src={Logo} alt="HealthPath" priority />
          </div>

          <div className={styles["login-center"]}>
            <h1>HealthPath Super Admin</h1>
            <h6>Sign in to the super admin console</h6>

            <form className={styles.form} onSubmit={loginDoc}>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={invalid}
                aria-describedby={invalid ? "login-error" : undefined}
                required
                value={userInfo.email}
                onChange={(event) =>
                  setUserInfo({ ...userInfo, email: event.target.value })
                }
              />

              <div className={styles["pass-input-div"]}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-label="Password"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "login-error" : undefined}
                  required
                  value={userInfo.password}
                  onChange={(event) =>
                    setUserInfo({ ...userInfo, password: event.target.value })
                  }
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button type="submit" disabled={loader}>
                {loader ? "Signing in..." : "Log In"}
              </button>
            </form>

            {invalid && (
              <p
                id="login-error"
                role="alert"
                aria-live="polite"
                className={styles["error-message"]}
              >
                {loginErr}
              </p>
            )}
          </div>
        </div>
      </div>

      {loader && <Preloader />}
      <CustomDialog
        show={showDialog}
        handleClose={closeDialog}
        message={dialogMessage}
      />
    </div>
  );
}
