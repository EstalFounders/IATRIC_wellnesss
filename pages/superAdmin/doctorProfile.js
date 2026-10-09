// pages/superAdmin/doctorProfile.js
// Dedicated page for the super-admin pencil in the doctor list. Same form as the
// doctor panel, but the save is a direct multipart update (PUT /api/addDoctor).
// The doctor is identified by the `?id=` query parameter.
//
// The origin is the literal "superAdmin": DoctorProfilePage / DoctorProfileForm
// only have to tell the two origins apart (`origin !== userTypeConstant.doctor`
// decides between "queue for approval" and "save directly"), and
// `userTypeConstant` has no super-admin entry.
import AuthenticatedComponent from "../api/auth/authenticatedcomponent";
import Layouts from "../../src/layout/Layouts";
import DoctorProfilePage from "../../src/components/Common/DoctorProfile/DoctorProfilePage";

export default function doctorProfile() {
  return (
    <AuthenticatedComponent>
      <Layouts header={7} footer={7}>
        <DoctorProfilePage origin="superAdmin" />
      </Layouts>
    </AuthenticatedComponent>
  );
}
