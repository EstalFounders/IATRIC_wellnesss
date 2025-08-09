import { useState } from "react";
import Layouts from "../../src/layout/Layouts";
import MedicineDeliveryComp from "../../src/components/medicines/MedicineDeliveryComp";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("labtest");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <MedicineDeliveryComp />
    </Layouts>
  );
}
