import AddDoctorForm from "../../src/components/superAdminComponent/AddDoctor/AddDoctorForm";
import LabTestComponent from "../../src/components/superAdminComponent/LabTest/Labtest";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";

const addDoctor = () => {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <LabTestComponent />
      </Layouts>
    </AuthenticatedComponent>
  );
};

export default addDoctor;
