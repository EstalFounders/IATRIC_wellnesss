import Head from "next/head";
import { useRouter } from "next/router";
import { contact_no, email } from "../../constant";
import { faqGroups, getFaqsForTopic } from "../../../data/faqs";
import { resolveServiceKey, resolveServiceName } from "../../customUtils/serviceLinks";

/**
 * Per-route JSON-LD, rendered from pages/_app.js *outside* <NoSsr>.
 *
 * Why here and not inside the page component: `_app` wraps every page in
 * <NoSsr> + <PersistGate>, so page components only exist in the browser and
 * anything they put in <head> never reaches the HTML a crawler is served first.
 * This is the same pattern - and the same reason - as <SeoMetadata> in
 * pages/_app.js.
 *
 * Add a route to STRUCTURED_DATA when its page is written; keep the facts in
 * sync with the page copy and src/constant.js.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.healthpath.co.in"
).replace(/\/$/, "");

// The /faqs copy lives in data/faqs.js, so its FAQPage schema is generated from
// the same source and can never drift from the answers users actually see.
const faqStructuredData = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/faqs#faq`,
      url: `${SITE_URL}/faqs`,
      name: "Frequently Asked Questions",
      mainEntity: faqGroups.flatMap((group) =>
        group.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        }))
      ),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/faqs#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "FAQ",
          item: `${SITE_URL}/faqs`,
        },
      ],
    },
  ],
});


/**
 * FAQPage + BreadcrumbList for a single service/topic page, built from the one
 * group that page actually shows (data/faqs.js), so the schema always matches the
 * visible Q&A. Returns null for a topic without a group of its own.
 */
const topicStructuredData = (topic, path) => {
  const group = getFaqsForTopic(topic);

  if (!group?.items?.length) return null;

  const url = `${SITE_URL}${path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        name: "Frequently Asked Questions",
        mainEntity: group.items.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: group.title,
            item: `${SITE_URL}/faqs#${group.anchor}`,
          },
        ],
      },
    ],
  };
};

const STRUCTURED_DATA = {
  "/about-us": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        "@id": `${SITE_URL}/about-us#organization`,
        name: "HealthPath",
        url: `${SITE_URL}/about-us`,
        logo: `${SITE_URL}/images/logo.png`,
        image: `${SITE_URL}/images/logo.png`,
        description:
          "HealthPath provides online doctor consultations, in-clinic appointments and home healthcare - doctor home visits, nursing care, lab tests and medicine delivery - across India.",
        telephone: contact_no,
        email: email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sector 57",
          addressLocality: "Gurgaon",
          addressRegion: "Haryana",
          postalCode: "122003",
          addressCountry: "IN",
        },
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "07:00",
            closes: "22:00",
          },
        ],
        availableService: [
          {
            "@type": "MedicalProcedure",
            name: "Online doctor consultation",
          },
          {
            "@type": "MedicalProcedure",
            name: "In-clinic appointment",
          },
          {
            "@type": "MedicalProcedure",
            name: "Doctor home visit",
          },
          {
            "@type": "MedicalTherapy",
            name: "Home nursing care",
          },
          {
            "@type": "MedicalTest",
            name: "Home lab test and blood work",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/about-us#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Us",
            item: `${SITE_URL}/about-us`,
          },
        ],
      },
    ],
  },
  "/faqs": faqStructuredData(),
  // These landings answer the same questions as /faqs, so they reuse the matching
  // group instead of a second, hand-written copy (the old Orange Health Labs FAQ
  // block that lived in the lab-test component has been deleted).
  "/labTest/homepage": topicStructuredData("lab-test", "/labTest/homepage"),
  "/medicine/homepage": topicStructuredData(
    "medicine-delivery",
    "/medicine/homepage"
  ),
};

/**
 * JSON-LD for a route. Pages whose content depends on the URL query cannot be a
 * plain key in STRUCTURED_DATA, so they are resolved here - `query` is populated
 * on the server for request-rendered pages (getServerSideProps in
 * service-details.js and department-single.js), which is what puts their FAQPage
 * schema in the first HTML.
 */
export const resolveStructuredData = (pathname, query = {}) => {
  if (pathname === "/service-details") {
    // Same two-step the page uses (ServiceDetailsComponent): the `Service` key
    // first, then the human name, so a URL that carries only one of them still
    // resolves to a topic.
    const topic = resolveServiceKey(query) || resolveServiceName(query);
    return topicStructuredData(topic, "/service-details");
  }

  if (pathname === "/department-single") {
    return topicStructuredData(query?.serviceName, "/department-single");
  }

  return STRUCTURED_DATA[pathname] || null;
};

const PageStructuredData = () => {
  // `query` is only populated on the server for request-rendered routes - see
  // resolveStructuredData() above.
  const { pathname, query } = useRouter();
  const jsonLd = resolveStructuredData(pathname, query);

  if (!jsonLd) return null;

  return (
    <Head>
      <script
        id="page-structured-data"
        key={`structured-data-${pathname}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
};

export default PageStructuredData;
