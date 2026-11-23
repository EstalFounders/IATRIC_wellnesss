import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh). The
// booking reference is read from the query string on the client, so the shell
// itself stays static.
export const getStaticProps = () => getSeoStaticProps("/feedback");

import ConsultationFeedbackPage from "../src/components/Feedback/ConsultationFeedbackPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Feedback = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Consultation Feedback" compact />
      <h1 className="sr-only">Share feedback about your consultation</h1>
      <ConsultationFeedbackPage />
    </Layouts>
  );
};

export default Feedback;
