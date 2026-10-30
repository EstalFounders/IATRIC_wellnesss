import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/all-doctors");


import AllDoctorsDoctors3 from "../src/components/All-doctors/AllDoctorsDoctors3";
import Statistic1 from "../src/components/Common/Statistic-1";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const AllDoctors = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Meet the Doctors" />
      <AllDoctorsDoctors3 />
      {/* <Statistic1 /> */}
    </Layouts>
  );
};

export default AllDoctors;
