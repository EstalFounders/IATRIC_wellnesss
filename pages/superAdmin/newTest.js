import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/superAdminComponent/HomepageComp";
import NewTest from "../../src/components/superAdminComponent/LabTest/NewTest";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <NewTest />
      </Layouts>
    </AuthenticatedComponent>
  );
}
