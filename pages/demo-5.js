import { useEffect, useState } from "react";
import About5 from "../src/components/Common/About-5";
import Banner5 from "../src/components/Common/Banner-5";
import Statistic1 from "../src/components/Common/Statistic-1";
import Tabs1 from "../src/components/Common/Tabs-1";
import Demo2Gallery1 from "../src/components/Demo-2/Demo2Gallery1";
import Demo2Reviews2 from "../src/components/Demo-2/Demo2Reviews2";
import Demo5About2 from "../src/components/Demo-5/Demo5About2";
import Demo5About6 from "../src/components/Demo-5/Demo5About6";
import Demo5Blog1 from "../src/components/Demo-5/Demo5Blog1";
import Demo5Contacts1 from "../src/components/Demo-5/Demo5Contacts1";
import Demo5Doctors1 from "../src/components/Demo-5/Demo5Doctors1";
import Demo5Hero5 from "../src/components/Demo-5/Demo5Hero5";
import Demo5Pricing3 from "../src/components/Demo-5/Demo5Pricing3";
import Demo5Services2 from "../src/components/Demo-5/Demo5Services2";
import Layouts from "../src/layout/Layouts";
import { eventEmitter } from "../src/constant";
import cartEventEmitter from "../src/eventEmitter/CartEventEmitter";
import HomepageComp from "../src/components/labTestComponent/HomepageComp";

const Demo5 = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    // Listen for cart update events
    cartEventEmitter.on(eventEmitter.navBarEventEmitter, (item) => {
      setActiveSection(item);
      console.log("Active Section Changed:", item);
    });
    // Clean up event listener
    return () => {
      cartEventEmitter.removeAllListeners("nav-option");
    };
  }, []);

  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      {activeSection.toLowerCase() === "home" && (
        <>
          <Demo5Hero5 />
          <Demo5About2 />
          <Demo5Services2 />
          <Tabs1 />
          <About5 />
          <Demo5About6 />
          <Statistic1 />
          <Demo5Doctors1 />
          <Demo2Reviews2 />
          <Demo5Pricing3 />
          <Demo2Gallery1 />
          <Demo5Blog1 />
          <Demo5Contacts1 />
          <Banner5 />
        </>
      )}

      {activeSection.toLowerCase() === "labtest" && (
        <>
          <HomepageComp />
        </>
      )}
    </Layouts>
  );
};

export default Demo5;
