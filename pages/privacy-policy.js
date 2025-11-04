import PrivacyPolicy from "../src/components/Terms/PrivacyPolicy";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const privacypolicy = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Privacy Policy" />
      <PrivacyPolicy />
    </Layouts>
  );
};

export default privacypolicy;
