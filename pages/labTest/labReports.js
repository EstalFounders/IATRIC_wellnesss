import LabReportComp from "../../src/components/labTestComponent/userLabReport/LabReportComp";
import Layouts from "../../src/layout/Layouts";

export default function Homepage() {
  return (
    <Layouts header={6}>
    <LabReportComp />
    </Layouts>
  );
}
