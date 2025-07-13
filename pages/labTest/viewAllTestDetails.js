import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/labTestComponent/HomepageComp";
import ViewAllTestDetails from "../../src/components/labTestComponent/ViewAllTestDetails";

export default function Homepage() {
  return (
    <Layouts header={1}>
      <ViewAllTestDetails />
    </Layouts>
  );
}
