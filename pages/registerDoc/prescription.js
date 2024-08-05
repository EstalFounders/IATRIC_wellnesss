// pages/login.js

import DoctorLogin from "../../src/components/registerDocComponent/DoctorLogin";
import HomepageComp from "../../src/components/registerDocComponent/HomepageComp";
import PrescriptionComp from "../../src/components/registerDocComponent/prescriptionComp";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function homepage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={7}>
        <PrescriptionComp />
       </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
