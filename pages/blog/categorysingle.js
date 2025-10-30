import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/blogComponent/HomepageComp";
import { useState } from "react";
import CategorySingleComp from "../../src/components/blogComponent/CateogorySingle";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("allcateogory");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <CategorySingleComp />
    </Layouts>
  );
}
