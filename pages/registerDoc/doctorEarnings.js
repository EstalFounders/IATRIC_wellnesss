// pages/login.js

import DoctorEarnings from "../../src/components/registerDocComponent/doctorEarning/doctorEarning";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function homepage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={7}>
        <DoctorEarnings />
       </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
