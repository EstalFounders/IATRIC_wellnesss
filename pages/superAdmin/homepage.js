import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/superAdminComponent/HomepageComp";
import NotificationHandler from "../../src/components/superAdminComponent/common/NotificationHandler";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <HomepageComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
