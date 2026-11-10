import { useDoctors } from "../src/customUtils/useDoctors";
import About5 from "../src/components/Common/About-5";
import DepartmentDoctors1 from "../src/components/Department-single/DepartmentDoctors1";
import DepartmentPage from "../src/components/Department-single/DepartmentPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FaqSection from "../src/components/Common/FaqSection";
import { getFaqsForTopic } from "../data/faqs";
import { normalizeDepartmentName } from "../src/components/Common/departmentIcons";

// The speciality name comes from the URL and is copied verbatim from the DB, which
// stores runs of spaces ("Neurology       (Brain & Spine)"), while the doctor row
// holds the same speciality spelled normally ("Neurology (Brain & Spine)"). A raw
// `includes` therefore hid every specialist of such a department, so both sides are
// reduced to one word-only key ("neurology brain and spine"). Punctuation and "&"
// vs "and" disappear, which also covers "E.N.T" / "Dietitian and Nutritionist".
const matchKey = (value) =>
  normalizeDepartmentName(value)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole-word phrase test in both directions: the department page often carries the
// short name ("Neurology") while the doctor lists the long one ("Neurology (Brain &
// Spine)"). Word boundaries matter - a bare `includes` would let the doctor tagged
// "ENT" show up under Dentistry or Gastroenterology.
const serviceMatches = (offeredService, serviceKey) => {
  const offeredKey = matchKey(offeredService);

  if (!offeredKey || !serviceKey) return false;
  if (offeredKey === serviceKey) return true;

  const isPhraseOf = (haystack, needle) =>
    new RegExp(`(^| )${escapeRegex(needle)}( |$)`).test(haystack);

  return (
    isPhraseOf(offeredKey, serviceKey) || isPhraseOf(serviceKey, offeredKey)
  );
};

const DepartmentSingle = () => {
  const { doctors } = useDoctors();
  let filterDoctors;
  const router = useRouter();
  const { serviceName, id } = router.query;
  // Display name: the DB name keeps its casing but carries runs of spaces, so only
  // the whitespace is collapsed ("Our Neurology (Brain & Spine) Specialists").
  const service = serviceName
    ? String(serviceName)
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/, (char) => char.toUpperCase())
    : "Department";

  filterDoctors = doctors.filter((doctor) =>
    (doctor.serviceOffered || []).some((offeredService) =>
      serviceMatches(offeredService, matchKey(service))
    )
  );

  useEffect(() => {
    if (!service) {
      console.log("No service name provided in the URL.");
    } else {
      console.log(`Service Name: ${service}`);
    }
  }, [service]);

  console.log("Doctors:", filterDoctors);

  // FAQs for THIS department only - the same block /faqs shows for this topic.
  // Null for a department without a group of its own, so nothing extra renders.
  const topicFaqs = getFaqsForTopic(serviceName || service);

  return (
    <Layouts>
      <PageBanner
        pageTitle={service}
        motherTitle="Our Departments"
        url="all-departments"
      />
      <DepartmentPage serviceName={service} id={id} />
      <DepartmentDoctors1 serviceName={service} doctors={filterDoctors} />

      {/* FAQs for this department only - copy straight from data/faqs.js, so it
          always matches the matching block on /faqs. */}
      {topicFaqs ? (
        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 offset-lg-1">
                <FaqSection
                  items={topicFaqs.items}
                  title="Frequently Asked Questions"
                  headingId="faq-department"
                  seeAllHref={`/faqs#${topicFaqs.anchor}`}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </Layouts>
  );
};

// Server-rendered so the first HTML already carries this department's FAQPage
// JSON-LD: PageStructuredData (rendered outside <NoSsr> in _app.js) reads
// router.query, which is only populated for a server-rendered request. The page
// body stays client-only - doctors come from redux behind <NoSsr>.
export async function getServerSideProps() {
  return { props: {} };
}

export default DepartmentSingle;
