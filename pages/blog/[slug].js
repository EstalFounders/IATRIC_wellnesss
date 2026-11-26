/**
 * Detail page for the legacy /blog/<slug> route. The same post is served at
 * /our-blog/<slug> (that is the URL the panel and the sitemap advertise), so a
 * permanent redirect avoids a duplicate copy of every article.
 */
export async function getServerSideProps({ params }) {
  const slug = params?.slug;

  return {
    redirect: {
      destination: slug ? `/our-blog/${encodeURIComponent(slug)}` : "/our-blog",
      permanent: true,
    },
  };
}

export default function LegacyBlogPostRedirect() {
  return null;
}
