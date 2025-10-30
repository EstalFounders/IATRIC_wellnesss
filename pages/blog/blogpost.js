import Layouts from "../../src/layout/Layouts";
import HomepageComp from "../../src/components/blogComponent/HomepageComp";
import { useState } from "react";
import AllCategoryComp from "../../src/components/blogComponent/AllCategoryComp";
import BlogPostComp from "../../src/components/blogComponent/BlogPostComp";

export default function Homepage() {
  const [activeSection, setActiveSection] = useState("blogpost");
  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <BlogPostComp />
    </Layouts>
  );
}
