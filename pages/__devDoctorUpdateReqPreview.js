// TEMPORARY render harness used to verify the redesigned doctor-update-request
// page in a browser without a super-admin session. Deleted right after the check.
import Layouts from "../src/layout/Layouts";
import ViewAllDocUpdateReqComp from "../src/components/superAdminComponent/ViewAllDocUpdateReqComp";

export default function DevDoctorUpdateReqPreview() {
  return (
    <Layouts header={7} footer={7}>
      <ViewAllDocUpdateReqComp />
    </Layouts>
  );
}
