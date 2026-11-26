import type { GetServerSideProps } from "next";
import { dbConnect } from "../src/lib/db";
import Doctor from "../src/models/doctorModel";
import { listPublishedBlogPosts } from "../src/api/marketing/helpers/blogQueries";
import { SITE_URL } from "../src/seo/siteConfig";
import {
  SERVICE_PAGE_SEO,
  SPECIALITY_SEO,
  departmentQueryFor,
  serviceQueryFor,
} from "../src/seo/servicesSeo";

/**
 * /sitemap.xml - request-rendered XML.
 *
 * The old pages/sitemap.ts used the App Router `MetadataRoute` convention inside
 * the Pages Router, so Next never routed it: /sitemap.xml answered 404 while
 * public/robots.txt advertised it. This is a Pages Router endpoint and writes
 * the XML itself.
 */
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/appointment", priority: "0.9", changefreq: "weekly" },
  { path: "/all-departments", priority: "0.9", changefreq: "weekly" },
  { path: "/all-services", priority: "0.9", changefreq: "weekly" },
  { path: "/all-doctors", priority: "0.8", changefreq: "daily" },
  { path: "/our-blog", priority: "0.8", changefreq: "weekly" },
  { path: "/about-us", priority: "0.7", changefreq: "monthly" },
  { path: "/faqs", priority: "0.7", changefreq: "monthly" },
  { path: "/pricing-1", priority: "0.6", changefreq: "monthly" },
  { path: "/contacts-2", priority: "0.6", changefreq: "monthly" },
  { path: "/gallery", priority: "0.5", changefreq: "monthly" },
  { path: "/join-us", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

type Entry = {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

const toEntry = (
  loc: string,
  priority: string,
  changefreq: string,
  lastmod?: string
): Entry => ({ loc, priority, changefreq, lastmod });

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const entries: Entry[] = [
    ...STATIC_ROUTES.map((route) =>
      toEntry(`${SITE_URL}${route.path}`, route.priority, route.changefreq)
    ),
    // Every speciality page. A topic that also owns a /service-details page
    // (corporate healthcare) is listed once, under the service URL.
    ...SPECIALITY_SEO.filter((entry) => !entry.kind.includes("service")).map(
      (entry) =>
        toEntry(
          `${SITE_URL}/department-single?${departmentQueryFor(entry)}`,
          "0.8",
          "monthly"
        )
    ),
    ...SERVICE_PAGE_SEO.map((entry) =>
      toEntry(
        `${SITE_URL}/service-details?${serviceQueryFor(entry)}`,
        "0.8",
        "monthly"
      )
    ),
  ];

  try {
    await dbConnect();
    const doctors = await Doctor.find({ isActive: true }).select("_id").lean();
    doctors.forEach((doctor: { _id: unknown }) => {
      entries.push(
        toEntry(`${SITE_URL}/doctor-info?doctorId=${String(doctor._id)}`, "0.6", "monthly")
      );
    });
  } catch (error) {
    // A missing DB must never break the sitemap - the static entries still ship.
    console.error("sitemap.xml doctors:", (error as Error).message);
  }

  try {
    const posts = await listPublishedBlogPosts();
    posts.forEach((post: { slug?: string; updatedAt?: string; publishedAt?: string }) => {
      if (!post.slug) return;

      const lastmod = post.updatedAt || post.publishedAt;
      entries.push(
        toEntry(
          `${SITE_URL}/our-blog/${post.slug}`,
          "0.6",
          "monthly",
          lastmod ? new Date(lastmod).toISOString() : undefined
        )
      );
    });
  } catch (error) {
    console.error("sitemap.xml blog:", (error as Error).message);
  }

  const seen = new Set<string>();
  const urls = entries
    .filter((entry) => {
      if (seen.has(entry.loc)) return false;
      seen.add(entry.loc);
      return true;
    })
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n` +
        (entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : "") +
        `    <changefreq>${entry.changefreq}</changefreq>\n` +
        `    <priority>${entry.priority}</priority>\n  </url>`
    )
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=600, stale-while-revalidate=3600");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
