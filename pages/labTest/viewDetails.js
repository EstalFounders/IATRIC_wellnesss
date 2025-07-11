import ViewDetails from "../../src/components/labTestComponent/viewDetails/ViewDetailsComp";
import Layouts from "../../src/layout/Layouts";

export default function Homepage() {
  return (
    <Layouts header={6}>
    <ViewDetails />
    </Layouts>
  );
}
