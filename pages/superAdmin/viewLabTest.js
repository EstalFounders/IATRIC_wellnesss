import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import ViewLabTestDetailsComp from "../../src/components/superAdminComponent/common/ViewLabTest";

export default function Homepage() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ViewLabTestDetailsComp />
      </Layouts>
    </AuthenticatedComponent>
  );
}
