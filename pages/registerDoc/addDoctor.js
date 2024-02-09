import AddDoctorForm from "../../src/components/registerDocComponent/AddDoctor/AddDoctorForm";
import Layouts from "../../src/layout/Layouts";

const addDoctor = () => {
  return(
    // <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
      <AddDoctorForm />
      </Layouts>
    //   </AuthenticatedComponent>
  )
}

export default addDoctor;