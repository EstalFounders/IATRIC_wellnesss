import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/labTestComponent/HomepageComp";
import { useState } from "react";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("labtest");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <HomepageComp />
    </Layouts>
  );
}
