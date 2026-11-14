import React from "react";
import Link from "next/link";
import { reportClientError } from "../../lib/clientError";

const wrapperStyle = {
  minHeight: "60vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
};

const cardStyle = {
  maxWidth: "520px",
  width: "100%",
  textAlign: "center",
  background: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: "12px",
  padding: "32px 24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
};

const buttonStyle = {
  border: "none",
  borderRadius: "8px",
  padding: "10px 22px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  background: "#0d5c63",
  color: "#ffffff",
};

/**
 * Catches a crash inside the page tree so the rest of the document (header,
 * footer, language widget) survives and the patient gets a way out, instead of
 * Next.js replacing the whole tab with "Application error: a client-side
 * exception has occurred".
 *
 * In `pages/_app.js` it is mounted with `key={router.pathname}`: a boundary stays
 * in its error state until it is remounted, and this way following any link to
 * another page gives that page a fresh boundary.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportClientError({
      message: error?.message || "React render error",
      // `error.stack` says where it was thrown, `componentStack` which component
      // tree rendered it - both are needed to find the cause.
      stack: [error?.stack, errorInfo?.componentStack]
        .filter(Boolean)
        .join("\n"),
      route: typeof window !== "undefined" ? window.location.pathname : "",
      fatal: true,
    });
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={wrapperStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#555", marginBottom: "24px" }}>
            This part of the page could not be displayed. Reloading usually fixes
            it - your data has not been lost.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button type="button" style={buttonStyle} onClick={this.handleReload}>
              Reload the page
            </button>
            <Link
              href="/"
              style={{ ...buttonStyle, background: "#ffffff", color: "#0d5c63", border: "1px solid #0d5c63", textDecoration: "none" }}
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
