import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/faqs");


import FaqsPage from "../src/components/Faqs/FaqsPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Faqs = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="FAQs" />
      <FaqsPage />
    </Layouts>
  );
};

export default Faqs;
