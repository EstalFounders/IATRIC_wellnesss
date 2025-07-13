import ViewDetails from "../../src/components/labTestComponent/viewDetails/ViewDetailsComp";
import Layouts from "../../src/layout/Layouts";

export default function Homepage() {
  return (
    <Layouts header={1}>
      <ViewDetails />
    </Layouts>
  );
}
