import Head from "next/head";
import MarketingAuthGuard from "../../src/marketing/components/MarketingAuthGuard";
import MarketingDashboard from "../../src/marketing/components/MarketingDashboard";

export default function MarketingDashboardPage() {
  return (
    <>
      <Head>
        <title>Marketing Dashboard | HealthPath</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MarketingAuthGuard>
        <MarketingDashboard />
      </MarketingAuthGuard>
    </>
  );
}
