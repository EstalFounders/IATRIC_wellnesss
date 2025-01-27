import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import AddLabComponent from "../../src/components/superAdminComponent/AddLab/AddLabComp";


const AddLab = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <AddLabComponent />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default AddLab;
