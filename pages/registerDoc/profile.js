// pages/registerDoc/profile.js
// "Your Profile" in the doctor panel: the edit-doctor popup turned into a page.
// Saving queues the changed fields for the super admin's approval.
import DoctorProfilePage from "../../src/components/Common/DoctorProfile/DoctorProfilePage";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";
import { userTypeConstant } from "../../src/constant";

export default function profile() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={7}>
        <DoctorProfilePage origin={userTypeConstant.doctor} />
      </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
