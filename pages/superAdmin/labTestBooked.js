import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import ConsultationBookedComp from "../../src/components/superAdminComponent/ConsultationBooked/ConsultationBooked";
import LabTestBookedComp from "../../src/components/superAdminComponent/LabTesBooked/LabTestBooked";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <LabTestBookedComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
