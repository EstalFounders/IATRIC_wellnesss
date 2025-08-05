import { useState } from "react";
import Layouts from "../../src/layout/Layouts";
import MedicineDeliveryComp from "../../src/components/medicines/MedicineDeliveryComp";
import ViewDetails from "../../src/components/medicines/viewDetails/ViewDetailsComp";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("medicine");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <ViewDetails />
    </Layouts>
  );
}
