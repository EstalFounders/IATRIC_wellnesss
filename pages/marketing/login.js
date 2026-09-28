import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import MarketingLogin from "../../src/marketing/components/MarketingLogin";
import { api } from "../../src/constant";

export default function MarketingLoginPage() {
  const router = useRouter();

  // Already signed in? Skip the login screen.
  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
      try {
        const response = await fetch(api.marketingSession, {
          cache: "no-store",
        });
        const data = await response.json();
        if (active && data?.authenticated) router.replace("/marketing");
      } catch (error) {
        // stay on the login screen
      }
    };

    checkExistingSession();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Marketing Login | HealthPath</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MarketingLogin />
    </>
  );
}
