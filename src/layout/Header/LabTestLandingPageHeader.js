import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { FaBars } from "react-icons/fa";
import Image from "next/image";
import CartPanel from "../../components/labTestComponent/common/CartPanel";
import { RequestOtp } from "../Component/RequestOtp";
import { OtpScreen } from "../Component/OtpScreen";
import styles from "../css/LabTestHeader.module.css"; // Import CSS module
import { FaCircleUser } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { TbReport } from "react-icons/tb";
import { GoSignOut } from "react-icons/go";
import { useRouter } from "next/router";
import LabTestModel from "../../components/labTestComponent/modal/LabTestModel";

function LabTesLandingPageHeader() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const updateCartItemCount = (count) => {
    setCartItemCount(count);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleOtpRequest = (mobNo) => {
    setOtpRequested(true);
  };

  const handlelogin = () => {
    setLoginModalOpen(true);
    setOtpRequested(false);
  };

  const handleClose = () => {
    setLoginModalOpen(false);
  };

  const handleSubmitOtp = () => {
    setLoginModalOpen(false);
    setLoggedIn(true);
  };

  const toggleDropdown = () => {
    setIsLoginDropdownOpen(!isLoginDropdownOpen);
  };
  
  const handleSignout = () => {
    setLoggedIn(false)
  }

  const handleViewReports = () => {
     router.push('/labTest/labReports')
  }

  return (
    <Container fluid className={styles.container}>
      <Row className={`align-items-center ${styles.row}`}>
        <Col xs={8} sm={4} md={2} className="d-flex align-items-center">
          <Image src="/images/logo.png" width={50} height={35} alt="Logo" />
        </Col>

        <Col md={6} className="d-none d-md-flex justify-content-center">
          <div className="mx-4 clickable-div" onClick={() => router.push('/labTest/homepage')}>Home</div>
          <div className="mx-4">Services</div>
          <div className="mx-4">Blog</div>
          <div className="mx-4">About</div>
        </Col>

        <Col xs={4} sm={4} md={3} className="d-flex justify-content-end">
          {isLoggedIn ? (
            <div className="clickable-div">
              <div onClick={toggleDropdown} className="d-flex flex-row">
                <div className="mr-2">
                  <FaCircleUser size={30} color="#D9D9D9" />
                </div>
                <div className={`mr-2 mt-1 ${styles.username}`}>Vinay</div>
                <div>
                  {isLoginDropdownOpen ? (
                    <IoIosArrowUp color="#D9D9D9" />
                  ) : (
                    <IoIosArrowDown color="#D9D9D9" />
                  )}
                </div>
              </div>
              {isLoginDropdownOpen && (
                <div className={`w-100 ${styles.dropdownMenu}`}>
                  <ul>
                    <li className="border-bottom py-3 mb-4 d-flex flex-row">
                      <div>
                        <FaCircleUser size={40} color="#E9F2D1" />
                      </div>
                      <div>
                        <div className={`mt-2 ml-1 ${styles.usernamedropdown}`}>
                          Vinay
                        </div>
                      </div>
                    </li>
                    <li className="d-flex flex-row">
                      <div className="mr-2">
                        <TbReport />
                      </div>
                      <div className={`mt-1 ${styles.dropdownItem}`} onClick={handleViewReports}>
                        Report History
                      </div>
                    </li>
                    <li className="border-top py-3 mt-4 d-flex flex-row">
                      <div className="mr-2">
                        <GoSignOut />
                      </div>
                      <div
                        className={`mt-1 ${styles.dropdownItem}`}
                        onClick={handleSignout}
                      >
                        Sign out
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                onClick={handlelogin}
                className={`clickable-div ${styles.loginButton}`}
              >
                Login
              </div>
            </>
          )}

          <div className={styles.cartIconContainer}>
            <PiShoppingCartSimpleBold size={20} onClick={togglePanel} />
            <div className={styles.cartItemCount}>{cartItemCount}</div>
          </div>

          <CartPanel
            isOpen={isPanelOpen}
            togglePanel={togglePanel}
            onUpdateCartItemCount={updateCartItemCount}
          />
        </Col>

        <Col xs={7} className="d-md-none d-flex justify-content-end">
          <FaBars
            size={25}
            onClick={toggleMobileMenu}
            className="clickable-div"
          />
        </Col>
      </Row>

      {mobileMenuOpen && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavLink} onClick={() => router.push('/labTest/homepage')}>Home</div>
          <div className={styles.mobileNavLink}>Services</div>
          <div className={styles.mobileNavLink}>Blog</div>
          <div className={styles.mobileNavLink}>About</div>
        </div>
      )}

      <LabTestModel isOpen={isLoginModalOpen}>
        {otpRequested ? (
          <OtpScreen onClose={handleClose} handleSubmitOtp={handleSubmitOtp} />
        ) : (
          <RequestOtp
            onClose={handleClose}
            handleOtpRequest={handleOtpRequest}
          />
        )}
      </LabTestModel>
    </Container>
  );
}

export default LabTesLandingPageHeader;
