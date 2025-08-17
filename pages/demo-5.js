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
import Demo5Services1 from "../src/components/Demo-5/Demo5Services1";
import Layouts from "../src/layout/Layouts";
import { eventEmitter } from "../src/constant";
import cartEventEmitter from "../src/eventEmitter/CartEventEmitter";
import HomepageComp from "../src/components/labTestComponent/HomepageComp";
import AnimatedSection from "../public/animation/animationSection/AnimatedSection";
import HowItWorks from "../src/components/Appointment/common/HowItsWorks";
import BenefitSection from "../src/components/Appointment/common/BenefitsSection";
import FaqSection from "../src/components/Appointment/common/FAQComponent";

const Demo5 = () => {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <Layouts header={1} footer={4} onNavClick={setActiveSection}>
      <>
        {/* Hero - No animation as it's immediately visible */}
        <Demo5Hero5 />

        {/* Wrap each component with AnimatedSection */}
        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Demo5About2 />
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Demo5Services1 />
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Demo5Services2 />
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Tabs1 />
        </AnimatedSection>

        {/* <AnimatedSection animation="fadeInUp" delay={0.3}>
          <About5 />
        </AnimatedSection> */}

        {/* <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Demo5About6 />
        </AnimatedSection> */}

        {/* <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Demo5Doctors1 />
        </AnimatedSection> */}

        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Statistic1 />
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Demo5Pricing3 />
        </AnimatedSection>


        <AnimatedSection animation="fadeInUp" delay={0.3} duration={1.2}>
          <Demo2Reviews2 />
        </AnimatedSection>

        {/* <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Demo5Pricing3 />
        </AnimatedSection> */}

        {/* <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Demo2Gallery1 />
        </AnimatedSection> */}

        {/* <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Demo5Blog1 />
        </AnimatedSection> */}

        {/* <AnimatedSection animation="fadeInUp" delay={0.2}>
          <Demo5Contacts1 />
        </AnimatedSection> */}

        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <Banner5 />
        </AnimatedSection> 

        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <BenefitSection />
        </AnimatedSection>
      </>
    </Layouts>
  );
};

export default Demo5;
