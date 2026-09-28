import Doctor2Details from "../src/components/Doctor-2/Doctor2Details";
import Demo2Reviews2 from "../src/components/Demo-2/Demo2Reviews2";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Doctor2 = () => {
  return (
    <Layouts>
      <PageBanner
        pageTitle="Doctor Page"
        motherTitle="Our Doctors"
        url="all-doctors"
      />

      <Doctor2Details />
      <Demo2Reviews2 />
    </Layouts>
  );
};

export default Doctor2;
