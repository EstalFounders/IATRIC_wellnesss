import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/blogComponent/HomepageComp";
import { useState } from "react";
import AllCategoryComp from "../../src/components/blogComponent/AllCategoryComp";
import AllLatestArticleComp from "../../src/components/blogComponent/AllLatestArticleComp";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("allcateogory");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <AllLatestArticleComp />
    </Layouts>
  );
}
