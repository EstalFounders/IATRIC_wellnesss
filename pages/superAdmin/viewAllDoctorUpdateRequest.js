import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import ViewAllDocUpdateReqComp from "../../src/components/superAdminComponent/ViewAllDocUpdateReqComp";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ViewAllDocUpdateReqComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
