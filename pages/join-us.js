import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/join-us");


import Demo5Contacts1 from "../src/components/Demo-5/Demo5Contacts1";
import JoinUs from "../src/components/JoinUs";
import Service1Doctors1 from "../src/components/Service-1/Service1Doctors1";
import Service1Page from "../src/components/Service-1/Service1Page";
import Service1Reviews2 from "../src/components/Service-1/Service1Reviews2";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Service1 = () => {
  return (
    <Layouts>
      <PageBanner
        pageTitle="Join Us"
        // motherTitle="Contact Us"
        // url="all-services"
      />
      <JoinUs />
    </Layouts>
  );
};

export default Service1;
