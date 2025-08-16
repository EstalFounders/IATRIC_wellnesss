import React, { useEffect, useState } from "react";
import Link from "next/link";
import MobileMenu from "../MobileMenu";
import { Col, Container, Row } from "react-bootstrap";
import {
  FaArrowDown,
  FaAudible,
  FaFacebook,
  FaHome,
  FaInstagram,
  FaLinkedin,
  FaMapMarkedAlt,
  FaPhone,
} from "react-icons/fa";
import {
  address,
  api,
  color_schema,
  contact_no,
  eventEmitter,
  facebook_page_url,
  labtest_cart_details_local_info,
  sessionStorageName,
} from "../../constant";
import PopupDialog from "../../components/Common/PopupDialog";
import { dial, navigate, openSupportWhatsAppWeb } from "../../helper";
import { useRouter } from "next/router";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import { ConsultationButton } from "../../components/Common/commonUi";
import { IoMdArrowDropdown } from "react-icons/io";
import cartEventEmitter from "../../eventEmitter/CartEventEmitter";
import { FaCartShopping } from "react-icons/fa6";
import CartPanel from "../../components/labTestComponent/common/CartPanel";
import MedicineCartPanel from "../../components/medicines/common/MedicineCartPanel";
import { getMedicineCartItems } from "../../components/medicines/common/CommonMethod";
import { getLabTestCartItems } from "../../components/labTestComponent/common/CommonMethod";
import { fetchConsultations } from "../../components/ApiService/UtilService";
import { useDispatch, useSelector } from "react-redux";

const Header1 = ({ toggleMenu, toggle, scrollToContact }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLabTestPage = router.pathname.includes("/labTest");
  const isMedicinePage = router.pathname.includes("/medicine");

  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const [isConsultationTypeOpen, setIsConsultationTypeOpen] = useState(false);
  const consultationTypes = useSelector(
    (state) => state.otherConfigSlice.activeConsultation
  );
  const hiddenRoutes = ["/appointment", "/some-other-route"];
  const [labtesttab, setLabtestTab] = useState(false);

  const [medicineCartItems, setMedicineCartItems] = useState(
    getMedicineCartItems()
  );
  const [labTestCartItems, setLabTestCartItems] = useState(
    getLabTestCartItems()
  );
  const [cartItemCount, setCartItemCount] = useState(labTestCartItems.length);
  const [medicineCartItemCount, setMedicineCartItemCount] = useState(
    medicineCartItems.length
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMedicinePanelOpen, setIsMedicinePanelOpen] = useState(false);

  const handleDialDialogOpen = () => {
    setIsDialDialogOpen(true);
  };

  const handleCloseDialDialog = () => {
    setIsDialDialogOpen(false);
  };

  const handleConsultationTypeOpenDialog = () => {
    console.log("tesinafa");
    setIsConsultationTypeOpen(true);
  };

  const handleConsultationTypeCloseDialog = () => {
    setIsConsultationTypeOpen(false);
  };

  const handleNavigate = (label) => {
    sessionStorage.setItem("selectedLabel", label);
    router.push("/appointment");
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  const toggleMedicinePanel = () => {
    setIsMedicinePanelOpen(!isMedicinePanelOpen);
  };

  const updateCartItemCount = (count) => {
    setCartItemCount(count);
  };
  const updateMedicineCartItemCount = (count) => {
    setMedicineCartItemCount(count);
  };

  useEffect(() => {
    if (!consultationTypes || consultationTypes.length === 0) {
      const getConsultation = async () => {
        await fetchConsultations(dispatch);
      };
      getConsultation();
    }
  }, []);

  useEffect(() => {
    console.log("cartItemCount changed:", cartItemCount);
    if (cartItemCount > 0) {
      setLabtestTab(true);
      console.log("Labtest tab set to true (cart has items).");
    } else {
      setLabtestTab(false);
      console.log("Labtest tab set to false (cart is empty).");
    }
  }, [cartItemCount]); //

  // Helper function to map names to icon numbers

  return (
    <header id="header" className="header">
      {/* MOBILE HEADER */}
      <div className="wsmobileheader clearfix">
        <Link legacyBehavior href="#">
          <a
            id="wsnavtoggle"
            onClick={() => toggleMenu()}
            className="wsanimated-arrow"
          >
            <span />
          </a>
        </Link>
        <span className="smllogo">
          <img
            src="images/logo.png"
            width={180}
            height={50}
            alt="mobile-logo"
          />
        </span>
        <Link legacyBehavior href="#">
          <a
            onClick={(e) => {
              e.preventDefault();
              handleDialDialogOpen();
            }}
            className="callusbtn"
          >
            <FaWhatsapp className="mx-1" />
          </a>
        </Link>
      </div>
      {/* HEADER STRIP */}
      <div
        className="headtoppart clearfix"
        style={{ backgroundColor: "#3b5f1d" }}
      >
        <div className="headerwp clearfix">
          {/* Address */}
          <div className="headertopleft">
            <div className="address clearfix">
              <span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sector%2057%20Gurgaon%20Haryana%20122003"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <FaMapMarkedAlt className="mx-1" />
                    <b style={{ fontWeight: "bold", fontSize: 14 }}>
                      Sector 57 , Gurgaon Haryana-122003
                    </b>
                  </span>
                </a>
              </span>
              <Link legacyBehavior href="/">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleDialDialogOpen();
                  }}
                  href={`tel:${contact_no}`}
                  className="callusbtn"
                  onMouseOver={(e) => {
                    e.target.style.color = "#8e8333";
                  }} // Change color on hover
                  onMouseOut={(e) => {
                    e.target.style.color = "#ffffff";
                  }}
                >
                  <FaWhatsapp className="mx-1" />
                  <b style={{ fontWeight: "bold", fontSize: 14 }}>
                    {contact_no}
                  </b>
                </a>
              </Link>
            </div>
            {/* <PopupDialog
              isOpen={isDialDialogOpen}
              onClose={handleCloseDialDialog}
              options={dialOptions}
            /> */}
          </div>
          {/* Social Links */}
          <div className="headertopright">
            {/* <a className="googleicon" title="Google" href="#">
              <i className="fab fa-google" />
              <span className="mobiletext02">Google</span>
            </a> */}
            <a
              className="linkedinicon"
              title="Linkedin"
              target="blank"
              href="https://www.linkedin.com/in/iatrichealthcare/"
            >
              <FaLinkedin size={25} />
              <span className="mobiletext02">Linkedin</span>
            </a>
            <a
              className="instagramicon"
              title="Instagram"
              target="blank"
              href="https://www.instagram.com/iatric.healthcare/"
            >
              <FaInstagram size={25} />
              <span className="mobiletext02">Instagram</span>
            </a>

            {/* <a className="twittericon" title="Twitter" href="#">
              <i className="fab fa-twitter" />
              <span className="mobiletext02">Twitter</span>
            </a> */}
            <a
              className="facebookicon"
              title="Facebook"
              target="blank"
              href="https://www.facebook.com/iatrichealthcare"
            >
              <FaFacebook size={25} />
              <span className="mobiletext02">Facebook</span>
            </a>
          </div>
        </div>
      </div>
      {/* END HEADER STRIP */}
      {/* NAVIGATION MENU */}
      <div>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Left: LOGO */}
            <div>
              <a href="#">
                <Image
                  src="/images/logo.png"
                  width={180}
                  height={60}
                  alt="header-logo"
                />
              </a>
            </div>

            {/* Center: MENU */}
            <nav className="wsmenu">
              <ul className="wsmenu-list h6 font-weight-bold d-flex gap-4 mb-0">
                <li>
                  <Link legacyBehavior href="/">
                    <a className="nav-link">Home</a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/about-us">
                    <a className="nav-link">About Us</a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/labTest/homepage">
                    <a
                      className="nav-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lab Test
                    </a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/service-1">
                    <a className="nav-link">Contact Us</a>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right: Button + Cart Icons */}
            <div className="d-flex align-items-center gap-3">
              {!hiddenRoutes.includes(router.pathname) && (
                <ConsultationButton onClick={handleConsultationTypeOpenDialog}>
                  Find a Doctor
                </ConsultationButton>
              )}

              {isLabTestPage && cartItemCount > 0 && (
                <div
                  className="position-relative"
                  onClick={togglePanel}
                  role="button"
                >
                  <FaCartShopping size={20} color={color_schema.green} />
                  <div className="cartItemCount position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                    {cartItemCount}
                  </div>
                </div>
              )}

              {isMedicinePage && medicineCartItemCount > 0 && (
                <div
                  className="position-relative"
                  onClick={toggleMedicinePanel}
                  role="button"
                >
                  <FaCartShopping size={20} color={color_schema.green} />
                  <div className="cartItemCount position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                    {medicineCartItemCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panels */}
        {isLabTestPage && (
          <CartPanel
            isOpen={isPanelOpen}
            togglePanel={togglePanel}
            cartItem={labTestCartItems}
            onUpdateCartItemCount={updateCartItemCount}
          />
        )}

        {isMedicinePage && (
          <MedicineCartPanel
            isOpen={isMedicinePanelOpen}
            togglePanel={toggleMedicinePanel}
            cartItem={medicineCartItems}
            onUpdateCartItemCount={updateMedicineCartItemCount}
          />
        )}

        <PopupDialog
          isOpen={isConsultationTypeOpen}
          onClose={handleConsultationTypeCloseDialog}
          options={consultationTypes}
        />
      </div>

      <MobileMenu />
      {/* END NAVIGATION MENU */}
    </header>
  );
};

export default Header1;
