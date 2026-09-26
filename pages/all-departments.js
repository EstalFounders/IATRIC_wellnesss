import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/all-departments");


import AllDepartmentServices7 from "../src/components/All-departments/AllDepartmentServices7";
import About5 from "../src/components/Common/About-5";
import Banner5 from "../src/components/Common/Banner-5";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const AllDepartments = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Our Departments" />
      <About5 />
      <AllDepartmentServices7 />
      <Banner5 />
    </Layouts>
  );
};

export default AllDepartments;
