import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/all-services");


import AllServicesTabs2 from "../src/components/All-services/AllServicesTabs2";
import Banner5 from "../src/components/Common/Banner-5";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const AllServices = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Our Services" />
      <h1 style={{ display: 'none' }}>Healthcare Services at HealthPath</h1>
      <AllServicesTabs2 />
      <Banner5 />
    </Layouts>
  );
};

export default AllServices;
