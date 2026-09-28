import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/appointment");


import AppointmentPage from "../src/components/Appointment/AppointmentPage";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Appointment = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Appointment" compact />
      <AppointmentPage />
    </Layouts>
  );
};

export default Appointment;
