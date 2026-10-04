import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Form } from "react-bootstrap";
import { api, marketing_info_local_storage, color_schema } from "../../constant";
import styles from "./css/marketingPanel.module.css";

const MarketingLogin = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Trim both values: mobile keyboards and autofill often append a space.
    const payload = {
      username: credentials.username.trim(),
      password: credentials.password.trim(),
    };

    try {
      const response = await fetch(api.marketingLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Sign in failed. Please try again.");
        return;
      }

      // The session lives in an httpOnly cookie. Confirm the browser kept it
      // before navigating, otherwise the guard would silently bounce us back.
      const sessionResponse = await fetch(api.marketingSession, {
        cache: "no-store",
      });
      const session = await sessionResponse.json().catch(() => ({}));

      if (!session?.authenticated) {
        setError(
          "Signed in, but this browser did not keep the session cookie. " +
            "Open the panel on http://localhost:3000 or over HTTPS — some " +
            "browsers drop cookies on plain-HTTP network addresses."
        );
        return;
      }

      try {
        sessionStorage.setItem(
          marketing_info_local_storage,
          JSON.stringify(session.user || data.user)
        );
      } catch (storageError) {
        // ignore storage errors - the httpOnly cookie carries the session
      }

      router.replace("/marketing");
    } catch (error) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.pageTitle}>Marketing Panel</h1>

        {error && <p className={styles.error}>{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="marketing-username" className="mb-3">
            <Form.Label className={styles.fieldLabel}>Username</Form.Label>
            <Form.Control
              type="email"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="marketing-password" className="mb-3">
            <Form.Label className={styles.fieldLabel}>Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <Form.Check
              type="checkbox"
              className="mt-2"
              label="Show password"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
          </Form.Group>

          <Button
            type="submit"
            disabled={loading}
            className="w-100"
            style={{ backgroundColor: color_schema.green, border: "none" }}
          >
            <strong>{loading ? "Signing in…" : "Sign in"}</strong>
          </Button>
        </Form>

        
      </div>
    </div>
  );
};

export default MarketingLogin;
