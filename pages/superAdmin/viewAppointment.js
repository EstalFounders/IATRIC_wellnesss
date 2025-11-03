import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import ViewAppointmentDetailsComp from "../../src/components/superAdminComponent/common/ViewAppointment";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ViewAppointmentDetailsComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
