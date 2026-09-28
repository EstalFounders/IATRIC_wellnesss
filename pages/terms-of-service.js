import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/terms-of-service");


import TermsPage from "../src/components/Terms/TermsPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Terms = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Terms & Privacy" />
      <TermsPage />
    </Layouts>
  );
};

export default Terms;
