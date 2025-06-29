import AppointmentPage from "../../src/components/Appointment/AppointmentPage";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

const bookConsultationFromAdmin = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <AppointmentPage />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default bookConsultationFromAdmin;
