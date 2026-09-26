import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/all-services");


import AllServicesTabs2 from "../src/components/All-services/AllServicesTabs2";
import AllServicesTestimonials2 from "../src/components/All-services/AllServicesTestimonials2";
import Banner5 from "../src/components/Common/Banner-5";
import Demo2Reviews2 from "../src/components/Demo-2/Demo2Reviews2";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const AllServices = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Our Services" />
      <AllServicesTabs2 />
      <Demo2Reviews2 />
      <Banner5 />
    </Layouts>
  );
};

export default AllServices;
