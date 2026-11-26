/**
 * /blog duplicated /our-blog: both render the same posts from the same public
 * API, and MARKETING_PAGES.blog points at /our-blog, so that is the canonical
 * URL. A permanent redirect keeps old links working and stops two pages
 * competing for the same content in search.
 */
export async function getServerSideProps() {
  return { redirect: { destination: "/our-blog", permanent: true } };
}

export default function LegacyBlogRedirect() {
  return null;
}
