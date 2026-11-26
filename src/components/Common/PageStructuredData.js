import Head from "next/head";
import { useRouter } from "next/router";
import { contact_no, email } from "../../constant";
import { faqGroups, getFaqsForTopic } from "../../../data/faqs";
import { resolveServiceKey, resolveServiceName } from "../../customUtils/serviceLinks";
import { SITE_URL, SITE_NAME, SOCIAL_PROFILES } from "../../seo/siteConfig";
import {
  SERVICE_PAGE_SEO,
  SPECIALITY_SEO,
  getServiceSeo,
  departmentQueryFor,
  serviceQueryFor,
} from "../../seo/servicesSeo";

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
// The origin now lives in src/seo/siteConfig.js, so JSON-LD, canonical URLs, the
// sitemap and robots.txt can never disagree about www vs non-www again.
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const physicianSchema = (doctorId, doctorName, specialty, educationTraining, languages) => ({
  "@context": "https://schema.org",
  "@type": "Physician",
  "@id": `${SITE_URL}/doctor-info?doctorId=${doctorId}#physician`,
  "name": doctorName,
  "url": `${SITE_URL}/doctor-info?doctorId=${doctorId}`,
  "medicalSpecialty": specialty || "General Practice",
  "qualifications": educationTraining?.map(edu => ({
    "@type": "EducationalOccupationalCredential",
    "name": edu
  })) || [],
  "knowsLanguage": languages || ["English", "Hindi"],
  "areaServed": {
    "@type": "Country",
    "name": "India"
  }
});

const blogPostSchema = (post) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/our-blog/${post.slug}#article`,
      "headline": post.title,
      "image": post.thumbnail || `${SITE_URL}/images/logo.png`,
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": post.author || "HealthPath"
      },
      "description": post.metaDescription || post.title,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/our-blog/${post.slug}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": `${SITE_URL}/our-blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `${SITE_URL}/our-blog/${post.slug}`
        }
      ]
    }
  ]
});

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
const topicStructuredData = (topic, path, queryString = "") => {
  const group = getFaqsForTopic(topic);
  const entry = getServiceSeo(topic);

  if (!group?.items?.length && !entry) return null;

  const url = queryString
    ? `${SITE_URL}${path}?${queryString}`
    : `${SITE_URL}${path}`;
  const isDepartment = path === "/department-single";
  const name = entry?.h1 || group?.title || topic;
  const parentName = isDepartment ? "All Departments" : "All Services";
  const parentUrl = `${SITE_URL}${isDepartment ? "/all-departments" : "/all-services"}`;

  const graph = [
    {
      "@type": isDepartment ? "MedicalSpecialty" : "MedicalWebPage",
      "@id": `${url}#topic`,
      name,
      url,
      isPartOf: { "@id": WEBSITE_ID },
      provider: { "@id": ORG_ID },
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
          name: parentName,
          item: parentUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name,
          item: url,
        },
      ],
    },
  ];

  // The same FAQ copy is rendered on the page (FaqSection), so the rich result
  // always matches the visible Q&A. Topics without a group skip this node.
  if (group?.items?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      name: "Frequently Asked Questions",
      mainEntity: group.items.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

/**
 * Organisation + website graph, emitted on EVERY route.
 *
 * Nothing told Google which entity the site belongs to before this: the only
 * Organization node lived on /about-us, so search had no site-level anchor for
 * the logo, phone, social profiles or the site name.
 */
export const siteWideGraph = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/logo.png`,
      image: `${SITE_URL}/images/logo.png`,
      telephone: contact_no,
      email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Sector 57",
        addressLocality: "Gurgaon",
        addressRegion: "Haryana",
        postalCode: "122003",
        addressCountry: "IN",
      },
      areaServed: { "@type": "Country", name: "India" },
      sameAs: SOCIAL_PROFILES,
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
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": ORG_ID },
      inLanguage: "en-IN",
    },
  ],
});

/** ItemList node - one entry per speciality / service / post. */
const itemListNode = (path, name, items) => ({
  "@type": "ItemList",
  "@id": `${SITE_URL}${path}#list`,
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: item.url,
  })),
});

const specialityItems = () =>
  SPECIALITY_SEO.map((entry) => ({
    name: entry.h1,
    url: `${SITE_URL}/department-single?${departmentQueryFor(entry)}`,
  }));

const serviceItems = () =>
  SERVICE_PAGE_SEO.map((entry) => ({
    name: entry.h1,
    url: `${SITE_URL}/service-details?${serviceQueryFor(entry)}`,
  }));

const STRUCTURED_DATA = {
  "/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": `${SITE_URL}/#clinic`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/images/logo.png`,
        telephone: contact_no,
        parentOrganization: { "@id": ORG_ID },
        availableService: serviceItems().map((item) => ({
          "@type": "MedicalProcedure",
          name: item.name,
          url: item.url,
        })),
      },
      itemListNode("/", "Departments & Specialities", specialityItems()),
    ],
  },
  "/appointment": {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/appointment#service`,
    name: "Online and in-clinic doctor appointment",
    serviceType: "Doctor consultation",
    url: `${SITE_URL}/appointment`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "India" },
  },
  "/all-departments": {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/all-departments#list`,
    name: "All Departments & Specialities",
    numberOfItems: specialityItems().length,
    itemListElement: specialityItems().map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  },
  "/all-services": itemListNode(
    "/all-services",
    "All Healthcare Services",
    serviceItems()
  ),
  "/our-blog": {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/our-blog#blog`,
    url: `${SITE_URL}/our-blog`,
    name: "HealthPath Health Blog",
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
  },
  "/pricing-1": {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/pricing-1#catalog`,
    name: "HealthPath services",
    url: `${SITE_URL}/pricing-1`,
    provider: { "@id": ORG_ID },
    itemListElement: serviceItems().map((item, index) => ({
      "@type": "Offer",
      position: index + 1,
      itemOffered: { "@type": "Service", name: item.name, url: item.url },
    })),
  },
  "/contacts-2": {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contacts-2#contact`,
    url: `${SITE_URL}/contacts-2`,
    mainEntity: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: contact_no,
          email,
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      ],
    },
  },
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
export const resolveStructuredData = (pathname, query = {}, doctorData = null) => {
  if (pathname === "/doctor-info" && doctorData) {
    return physicianSchema(
      doctorData._id,
      doctorData.name,
      doctorData.serviceOffered?.[0],
      doctorData.educationTraining,
      doctorData.languages
    );
  }

  if (pathname === "/service-details") {
    // Same two-step the page uses (ServiceDetailsComponent): the `Service` key
    // first, then the human name, so a URL that carries only one of them still
    // resolves to a topic.
    const topic = resolveServiceKey(query) || resolveServiceName(query);
    const entry = getServiceSeo(topic);

    return topicStructuredData(
      topic,
      "/service-details",
      entry ? serviceQueryFor(entry) : ""
    );
  }

  if (pathname === "/department-single") {
    const entry = getServiceSeo(query?.serviceName);

    return topicStructuredData(
      entry?.key || query?.serviceName,
      "/department-single",
      entry ? departmentQueryFor(entry) : ""
    );
  }

  if (pathname === "/our-blog/[slug]" && query.slug) {
    // Blog schema would be resolved here with postData from SSR/SSG
    // For now, returning null as blog posts need to be fetched
    return null;
  }

  return STRUCTURED_DATA[pathname] || null;
};

const PageStructuredData = ({ doctorData = null }) => {
  // `query` is only populated on the server for request-rendered routes - see
  // resolveStructuredData() above.
  const { pathname, query } = useRouter();
  const jsonLd = resolveStructuredData(pathname, query, doctorData);
  // The organisation / website graph ships on every route, so search always has
  // a site-level entity even on pages with no schema of their own.
  const siteGraph = siteWideGraph();

  return (
    <Head>
      <script
        id="site-structured-data"
        key="site-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph) }}
      />
      {jsonLd ? (
        <script
          id="page-structured-data"
          key={`structured-data-${pathname}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  );
};

export default PageStructuredData;
