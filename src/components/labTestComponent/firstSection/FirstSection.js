import {
  Container,
  InputGroup,
  FormControl,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import {
  FaFilePrescription,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import styles from "../css/FirstSection.module.css"; // Import the CSS module
import { useRouter } from "next/router";
import { MdOutlineArrowRight } from "react-icons/md";
import Image from "next/image";
import Slideshow from "./Slideshow";
import { useState } from "react";
import { BsArrowRightCircleFill } from "react-icons/bs";

export default function FirstSection() {
  const router = useRouter();
  const location = useState('noida')

  const handleLocationClick = () => {
    // Your location click handler logic
  };

  return (
    <Container fluid className="bg-white">
      <Row className="align-items-center mx-5">
        <Col  md={2} className="text-center text-md-left mb-3 mb-md-0">
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleLocationClick}
          >
            <FaMapMarkerAlt color="#8E8333" size={24} />
            <span
              style={{
                marginLeft: "10px",
                fontWeight: "bold",
                color: "#3b5f1d",
              }}
            >
              Delivering to {location}
            </span>
          </div>
        </Col>
        <Col md={10} className="mb-3 mb-md-0">
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search for tests, labs, etc."
              aria-label="Search"
              aria-describedby="basic-addon2"
              className="searchInput"
            />
            <InputGroup.Append>
              <Button variant="outline-secondary">Search</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>

      <Slideshow />

      <Row className="d-flex justify-content-center mx-5">
        <Col  sm={10} md={8} lg={4} className="mt-3">
          <div
            className={`d-flex align-items-center ${styles.optionButton}`}
          >
            <Image
              width={50}
              height={50}
              src="/images/labtest/prescription.png"
              alt="Upload Prescription"
              className={`${styles.optionImage} mr-2`}
            />
            <div className="text-left">
              <div className={`${styles.optionText}`}>
                Upload Prescription
              </div>
              <div className={`${styles.optionSubtext}`}>
                Our team will help
              </div>
              <div className={`${styles.rightArrowIcon}`}>
                <BsArrowRightCircleFill color="#fff" />
              </div>
            </div>
          </div>
        </Col>
        <Col  sm={10} md={8} lg={4} className="mt-3">
          <div
            className={`d-flex align-items-center ${styles.optionButton}`}
           
          >
            <Image
              width={50}
              height={50}
              src="/images/labtest/consultation.png"
              alt="Call Health Advisor"
              className={`${styles.optionImage} mr-2`}
            />
            <div className="text-left">
              <div className={`${styles.optionText}`}>
                Call Health Advisor
              </div>
              <div className={`${styles.optionSubtext}`}>
                Our experts will guide you
              </div>
              <div className={`${styles.rightArrowIcon}`}>
                <BsArrowRightCircleFill color="#fff" />
              </div>
            </div>
          </div>
        </Col>
        <Col  sm={10} md={8} lg={4} className="mt-3">
          <div
            className={`d-flex align-items-center ${styles.optionButton}`}
            
          >
            <Image
              width={50}
              height={50}
              src="/images/labtest/whatsapp.png"
              alt="Book on WhatsApp"
              className={`${styles.optionImage} mr-2`}
            />
            <div className="text-left">
              <div className={`${styles.optionText}`}>Book on WhatsApp</div>
              <div className={`${styles.optionSubtext}`}>
                To book a lab test, say hi
              </div>
              <div className={`${styles.rightArrowIcon}`}>
                <BsArrowRightCircleFill color="#fff" />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
