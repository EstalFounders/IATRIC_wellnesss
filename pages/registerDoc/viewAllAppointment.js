// pages/registerDoc/viewAllAppointment.js
// The full appointment list behind the home page's "View all appointments"
// button; the type query param (Today|Total) selects the initial filter.

import ViewAllAppointmentComp from "../../src/components/registerDocComponent/ViewAllAppointmentComp";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function homepage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={7}>
        <ViewAllAppointmentComp />
      </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
