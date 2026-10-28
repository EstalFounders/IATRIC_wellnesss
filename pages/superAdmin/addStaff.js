import AddStaffForm from "../../src/components/superAdminComponent/AddStaff/AddStaffForm";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

const AddStaff = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <AddStaffForm />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default AddStaff;
