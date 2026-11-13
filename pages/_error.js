import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Layouts from "../src/layout/Layouts";
import { reportClientError } from "../src/lib/clientError";

const cardStyle = {
  minHeight: "50vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 20px",
  textAlign: "center",
};

const buttonStyle = {
  display: "inline-block",
  borderRadius: "8px",
  padding: "10px 22px",
  fontSize: "16px",
  fontWeight: 600,
  background: "#0d5c63",
  color: "#ffffff",
  textDecoration: "none",
};

/**
 * Next.js' own error page (used for a thrown error during SSR/data fetching, an
 * unknown route and any 5xx). Without this file the framework renders an
 * unstyled "Application error" / "404" page that carries no branding, no way back
 * and no record of what happened.
 *
 * Diagnostics: the status code is shown (useful when a patient reads it out), the
 * raw error text is only rendered in development - a server message can contain
 * internals - and the crash is reported from the browser like every other client
 * error.
 */
function ErrorPage({ statusCode, errorMessage }) {
  const router = useRouter();

  const copy = useMemo(() => {
    if (statusCode === 404) {
      return {
        title: "Page not found",
        body: "The page you are looking for has moved or no longer exists.",
      };
    }
    return {
      title: "Something went wrong",
      body: "We could not load this page. Please try again in a moment - if it keeps happening, contact our support team.",
    };
  }, [statusCode]);

  useEffect(() => {
    reportClientError({
      message: `Error page ${statusCode}${errorMessage ? `: ${errorMessage}` : ""}`,
      route: router.asPath,
      fatal: statusCode >= 500,
    });
  }, [statusCode, errorMessage, router.asPath]);

  return (
    <Layouts>
      <Head>
        <title>{`${copy.title} | Health Path`}</title>
        {/* An error page has no business in a search index. */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={cardStyle}>
        <div>
          <p style={{ fontSize: "58px", fontWeight: 700, marginBottom: "8px" }}>
            {statusCode}
          </p>
          <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
            {copy.title}
          </h1>
          <p style={{ color: "#555", maxWidth: "520px", margin: "0 auto 24px" }}>
            {copy.body}
          </p>
          <Link href="/" style={buttonStyle}>
            Go to homepage
          </Link>
        </div>
      </div>
    </Layouts>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode || (err ? 500 : 404);
  return {
    statusCode,
    // In production the message stays on the server (and in the sheet): it can
    // name internal modules, database errors or file paths.
    errorMessage:
      process.env.NODE_ENV === "production" ? "" : err?.message || "",
  };
};

export default ErrorPage;
