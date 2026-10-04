import AboutUsInfo4 from "../src/components/About-us/AboutUsInfo4";
import AboutUsVideo2 from "../src/components/About-us/AboutUsVideo2";
import Banner5 from "../src/components/Common/Banner-5";
import Services7 from "../src/components/Common/Services-7";
import Statistic1 from "../src/components/Common/Statistic-1";
import DiscoverMoreComp from "../src/components/discover-more/DiscoverMore";
import ServiceDetailsComp from "../src/components/serviceDetails/ServiceDetailsComponent";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import { resolveServiceName } from "../src/customUtils/serviceLinks";
import { useRouter } from "next/router";

const AboutUs = () => {
  const router = useRouter();
  // Breadcrumb shows the clean service name (never a raw slug/id).
  const serviceName = resolveServiceName(router.query) || "Our Services";

  return (
    <Layouts>
      <PageBanner
        pageTitle={serviceName}
        motherTitle={"discover-more"}
        url={"discover-more"}
      />
      <ServiceDetailsComp />
      {/* <AboutUsInfo4 /> */}
      {/* END INFO-4 */}
      {/* STATISTIC-1
			============================================= */}
      {/* <Statistic1 /> */}
      {/* END STATISTIC-1 */}
      {/* VIDEO-2
			============================================= */}
      {/* <AboutUsVideo2 /> */}
      {/* END VIDEO-2 */}
      {/* SERVICES-7
			============================================= */}
      {/* <Services7 /> */}
      {/* END SERVICES-7 */}
      {/* BANNER-5
			============================================= */}
      {/* <Banner5 /> */}
    </Layouts>
  );
};

// Server-rendered so the first HTML already carries this service's FAQPage
// JSON-LD: PageStructuredData (rendered outside <NoSsr> in _app.js) reads
// router.query, which is only populated for a server-rendered request. The page
// body stays client-only (NoSsr + redux).
export async function getServerSideProps() {
  return { props: {} };
}

export default AboutUs;
