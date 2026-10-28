import ManageStaffComp from "../../src/components/superAdminComponent/Staff/ManageStaffComp";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

const Staff = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <ManageStaffComp />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default Staff;
