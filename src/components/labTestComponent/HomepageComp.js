import { Container, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import {
  FaFilePrescription,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { useRouter } from "next/router";
import FirstSection from "./firstSection/FirstSection";
import MostPopularCheckup from "./mostPopularCheckup/MostPopularCheckup";
import VitalOrganCheckup from "./vitalOrganCheckUp/VitalOrganCheckup";
import HealthyBodyCheckup from "./healthyBodyCheckup/HealthyBodyCheckup";
import Footer4 from "../../layout/Footer/Footer4";
import FAQ from "./faqs/FAQ";
import { storeLabTestCategory } from "./common/CommonMethod";
import { useEffect, useState } from "react";
import { eventEmitter } from "../../constant";
import cartEventEmitter from "../../eventEmitter/CartEventEmitter";
import ViewDetails from "./viewDetails/ViewDetailsComp";
import ViewAllTestDetails from "./ViewAllTestDetails";

export default function HomepageComp() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("labtest");

  const handleLocationClick = () => {
    // Your location click handler logic
  };

  useEffect(() => {
    // Listen for cart update events
    cartEventEmitter.on(eventEmitter.labTestEventEmitter, (item) => {
      setActiveSection(item);
      console.log("Active Section Changed:", item);
    });
    // Clean up event listener
    return () => {
      cartEventEmitter.removeAllListeners("nav-option");
    };
  }, []);

  return (
    <>
      <div className="mt-2">
        {activeSection.toLowerCase() === "labtest" && (
          <>
            <Row>
              <Col>
                <FirstSection />
              </Col>
            </Row>
            <Row className="mt-5" style={{ backgroundColor: "#EFEFEF" }}>
              <Col>
                <MostPopularCheckup />
              </Col>
            </Row>
            <Row>
              <Col>
                <VitalOrganCheckup />
              </Col>
            </Row>
            <Row>
              <Col>
                <HealthyBodyCheckup />
              </Col>
            </Row>
            <Row>
              <Col>
                <FAQ />
              </Col>
            </Row>
          </>
        )}
        {activeSection.toLowerCase() === "viewdetails" && <ViewDetails />}
        {activeSection.toLowerCase() === "viewalltestdetails" && <ViewAllTestDetails />}
      </div>
    </>
  );
}
