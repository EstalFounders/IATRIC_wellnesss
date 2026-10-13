// pages/registerDoc/homepage.js
// The doctor panel's home page: the session guard mounts HomepageComp inside the
// doctor header/footer layout (header 9 = the doctor panel bar).

import HomepageComp from "../../src/components/registerDocComponent/homepage/HomepageComp";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function DoctorHomePage() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={8}>
        <HomepageComp />
      </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
