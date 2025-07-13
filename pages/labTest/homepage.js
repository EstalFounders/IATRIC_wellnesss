import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/labTestComponent/HomepageComp";

export default function Homepage() {
  return (
    <Layouts header={1}>
      <HomepageComp />
    </Layouts>
  );
}
