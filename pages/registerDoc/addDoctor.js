import AddDoctorForm from "../../src/components/registerDocComponent/AddDoctor/AddDoctorForm";
import Layouts from "../../src/layout/Layouts";
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";


const addDoctor = () => {
  return(
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
      <AddDoctorForm />
      </Layouts>
     </AuthenticatedComponent>
  )
}

export default addDoctor;