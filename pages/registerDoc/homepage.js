// pages/login.js

import DoctorLogin from "../../src/components/registerDocComponent/DoctorLogin";
import HomepageComp from "../../src/components/registerDocComponent/homepage/HomepageComp";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function homepage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={7}>
        <HomepageComp />
      </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
