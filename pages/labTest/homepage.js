import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/labTestComponent/HomepageComp";

export default function Homepage() {
  return (
      <Layouts header={6} footer={7}>
        <HomepageComp />
      </Layouts>
  );
}
