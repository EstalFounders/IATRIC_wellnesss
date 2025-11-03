import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import ViewAllDocLeaveReqComp from "../../src/components/superAdminComponent/ViewAllDocLeaveReqComp";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ViewAllDocLeaveReqComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
