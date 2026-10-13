// pages/login.js

import PrescriptionComp from "../../src/components/registerDocComponent/prescriptionComp";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function homepage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={8}>
        <PrescriptionComp />
       </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
