import { Container, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import {
  FaFilePrescription,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { useRouter } from "next/router";
import FirstSection from "./firstSection/FirstSection";
import FeaturedHealthCheckUp from "./featuredHealthCheckUp/FeaturedHealthCheckUp";
import FindTestByHealthConcern from "./FindTest/FindTestByHealthConcern";

export default function HomepageComp() {
  const router = useRouter();

  const handleLocationClick = () => {
    // Your location click handler logic
  };

  return (
    <>
      <div className="mt-2">
        <Row>
          <Col>
            <FirstSection />
          </Col>
        </Row>
        <Row>
          <Col>
            <FeaturedHealthCheckUp />
          </Col>
        </Row>
        <Row>
          <Col>
            <FindTestByHealthConcern />
          </Col>
        </Row>
      </div>
    </>
  );
}
