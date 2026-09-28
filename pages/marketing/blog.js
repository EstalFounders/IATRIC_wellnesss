import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import MarketingAuthGuard from "../../src/marketing/components/MarketingAuthGuard";
import MarketingShell from "../../src/marketing/components/MarketingShell";
import BlogManagementView from "../../src/marketing/blog";

export default function MarketingBlogPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Blog Management | Marketing Panel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <MarketingAuthGuard>
        <MarketingShell
          title="Blog management"
          subtitle="Create, publish and edit the posts shown in the Demo5Blog1 section of the website."
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
          <BlogManagementView />
        </MarketingShell>
      </MarketingAuthGuard>
    </>
  );
}
