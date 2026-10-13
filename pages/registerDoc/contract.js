// pages/registerDoc/contract.js
// "Contract" in the doctor panel: a read-only record of the hire details, the
// documents on file and the degrees that print on the prescription.
//
// The page never writes - not even a document upload - because a contract is
// only changed by the super admin. Its single action hands the doctor to
// /registerDoc/profile, whose save flow queues the changed fields for approval
// (see DoctorContractPage.js).
import DoctorContractPage from "../../src/components/Common/DoctorProfile/DoctorContractPage";
import Layouts from "../../src/layout/Layouts";
import DoctorAuthenticatedComponent from "../api/auth/doctorauthenticatedcomponent";

export default function contract() {
  return (
    <DoctorAuthenticatedComponent>
      <Layouts header={9} footer={8}>
        <DoctorContractPage />
      </Layouts>
    </DoctorAuthenticatedComponent>
  );
}
