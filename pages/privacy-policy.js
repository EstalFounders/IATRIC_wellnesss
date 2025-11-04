import PrivacyPolicy from "../src/components/Terms/PrivacyPolicy";
import TermsPage from "../src/components/Terms/TermsPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Privacypolicy = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Privacy Policy" />
      <PrivacyPolicy />
    </Layouts>
  );
};

export default Privacypolicy;
