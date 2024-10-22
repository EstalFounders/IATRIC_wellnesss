import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { FaBars } from "react-icons/fa"; // Hamburger icon for mobile
import Image from "next/image";

// External styles as a constant object
const styles = {
  container: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    marginTop: "1rem",
  },
  row: {
    padding: "18px 13px",
    gap: "10px",
    borderRadius: "10px",
    border: "1px solid #EDEDED",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    backgroundColor: "white",
  },
  loginButton: {
    backgroundColor: "#D1ECA0",
    width: "74px",
    height: "33px",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    lineHeight: "17.07px",
  },
  navLink: {
    color: "#000",
  },
  dropdownMenu: {
    position: "absolute",
    zIndex: 1050, // Ensures it overlays other content
    top: "100%", // Makes sure it appears directly below the dropdown
    left: 0,
  },
  mobileNav: {
    display: "none", // Initially hidden, shown only in mobile view
    backgroundColor: "#ffffff",
    position: "absolute",
    top: "100%",
    width: "100%",
    textAlign: "center",
    zIndex: 1050,
    border: "1px solid #EDEDED",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  },
  mobileNavLink: {
    padding: "10px 0",
    borderBottom: "1px solid #EDEDED",
  },
};

// Main Component
function LabTesLandingPageHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    console.log('testing for toggle')
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Container fluid style={styles.container}>
      <Row className="align-items-center" style={styles.row}>
        {/* Logo */}
        <Col xs={8} sm={4} md={2} className="d-flex align-items-center">
          <Image src="/images/logo.png" width={50} height={35} alt="Logo" />
        </Col>

        {/* Navigation Links (Hidden on mobile) */}
        <Col md={6} className="d-none d-md-flex justify-content-center">
          <div className="mx-4">Home</div>
          <div className="mx-4">Services</div>
          <div className="mx-4">Blog</div>
          <div className="mx-4">About</div>
        </Col>

        {/* Login and Cart (Visible on all screen sizes) */}
        <Col xs={4} sm={4} md={3} className="d-flex justify-content-end">
          <div style={styles.loginButton}>Login</div>
          <div className="ml-3">
            <PiShoppingCartSimpleBold size={20} />
          </div>
        </Col>

        {/* Hamburger Menu Icon (Visible only on mobile) */}
        <Col xs={7} className="d-md-none d-flex justify-content-end">
          <FaBars size={25} onClick={toggleMobileMenu} style={{ cursor: "pointer" }} />
        </Col>
      </Row>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
        >
          <div style={styles.mobileNavLink}>Home</div>
          <div style={styles.mobileNavLink}>Services</div>
          <div style={styles.mobileNavLink}>Blog</div>
          <div style={styles.mobileNavLink}>About</div>
        </div>
      )}
    </Container>
  );
}

export default LabTesLandingPageHeader;
