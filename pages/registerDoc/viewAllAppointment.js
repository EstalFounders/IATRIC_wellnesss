// pages/login.js

import HomepageComp from "../../src/components/registerDocComponent/homepage/HomepageComp";
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
