import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/labTestComponent/HomepageComp";
import ViewCheckupsPage from "../../src/components/labTestComponent/viewcheckups/ViewCheckups";

export default function Homepage() {
  return (
    <Layouts header={1}>
      <ViewCheckupsPage />
    </Layouts>
  );
}
