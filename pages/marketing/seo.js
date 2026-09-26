import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import MarketingAuthGuard from "../../src/marketing/components/MarketingAuthGuard";
import MarketingShell from "../../src/marketing/components/MarketingShell";
import SeoManagementView from "../../src/marketing/seo";

export default function MarketingSeoPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SEO Keywords | Marketing Panel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <MarketingAuthGuard>
        <MarketingShell
          title="SEO keywords"
          subtitle="Manage the meta title, meta description and focus keywords applied to each page."
          actions={
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => router.push("/marketing")}
            >
              ← Back to dashboard
            </Button>
          }
        >
          <SeoManagementView />
        </MarketingShell>
      </MarketingAuthGuard>
    </>
  );
}
