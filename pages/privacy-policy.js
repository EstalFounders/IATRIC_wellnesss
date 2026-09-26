import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/privacy-policy");


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
