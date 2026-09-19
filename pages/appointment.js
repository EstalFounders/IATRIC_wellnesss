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
