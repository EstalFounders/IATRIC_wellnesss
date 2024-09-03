import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa"; // Importing a back icon
import Navbar from "../../components/registerDocComponent/NavBarComponent/Navbar";

const LabTestHeader = ({ session }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    color: isHovered ? "#fff" : "#8E8333",
    backgroundColor: isHovered ? "#3b5f1d" : "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.3s ease, color 0.3s ease",
  };

  

  const handleBackClick = () => {
    router.push("/"); // Redirect to the home page
  };

  return (
    <Row className="bg-white border-bottom align-items-center">
      <Col xs={12} md={4} className="mt-4 d-flex align-items-center">
        <FaArrowLeft
          size={20}
          onClick={handleBackClick}
          style={{ cursor: "pointer"}}
          className="ml-4"          
        />
      </Col>
      <Col xs={12} md={4} className="text-center py-3">
        <Image
          src="/images/logo.png" // Make sure the path is correct starting from the 'public' directory
          width={180}
          height={70}
          alt="mobile-logo"
          className="pt-2"
        />
      </Col>
    </Row>
  );
};

export default LabTestHeader;
