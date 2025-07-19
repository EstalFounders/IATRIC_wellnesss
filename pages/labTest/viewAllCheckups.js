import Layouts from "../../src/layout/Layouts";
import ViewAllCheckUpDetails from "../../src/components/labTestComponent/ViewAllCheckUpDetails";

export default function Homepage() {
  return (
    <Layouts header={1}>
      <ViewAllCheckUpDetails />
    </Layouts>
  );
}
