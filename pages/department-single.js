import { useSelector } from "react-redux";
import About5 from "../src/components/Common/About-5";
import DepartmentDoctors1 from "../src/components/Department-single/DepartmentDoctors1";
import DepartmentPage from "../src/components/Department-single/DepartmentPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FaqSection from "../src/components/Common/FaqSection";
import { getFaqsForTopic } from "../data/faqs";

const DepartmentSingle = () => {
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  let filterDoctors;
  const router = useRouter();
  const { serviceName, id } = router.query;
  const service = serviceName
    ? serviceName
        .replace(/-/g, " ")
        .replace(/\b\w/, (char) => char.toUpperCase())
    : "Department";

  filterDoctors = doctors.filter((doctor) =>
    doctor.serviceOffered.some((offeredService) =>
      offeredService.toLowerCase().includes(service.toLowerCase())
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
