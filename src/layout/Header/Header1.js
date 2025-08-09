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

const Header1 = ({ toggleMenu, toggle, scrollToContact }) => {
  const router = useRouter();
  const isLabTestPage = router.pathname.includes("/labTest");
  const isMedicinePage = router.pathname.includes("/medicine");

  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const [isConsultationTypeOpen, setIsConsultationTypeOpen] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState();
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

  const dialOptions = [
    { label: "Dial", action: dial, icon: 0 },
    { label: "Whatsapp", action: openSupportWhatsAppWeb, icon: 1 },
  ];

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
    const processConsultations = (data) => {
      // Filter active items and transform into consultationOptions format
      console.log(data, "56 processed consultation");
      const activeConsultations = data
        .filter((item) => item.isActive)
        .map((item) => ({
          label: item.name,
          action: () => handleNavigate(item.name),
          icon: getIconByName(item.name),
        }));

      console.log(activeConsultations, "active consultation");

      // Set options and store in sessionStorage
      setConsultationTypes(activeConsultations);
      sessionStorage.setItem(
        sessionStorageName.ConsultationFee,
        JSON.stringify(data)
      );
    };

    const storedConsultations = sessionStorage.getItem(
      sessionStorageName.ConsultationFee
    );

    const parsedConsultations = JSON.parse(storedConsultations);

    console.log(parsedConsultations, "stored consultation in header");

    if (parsedConsultations && parsedConsultations.length > 0) {
      console.log(parsedConsultations, "paresed consultation 83");
      processConsultations(parsedConsultations);
    } else {
      fetch(api.consiltationFee)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch consultations");
          }
          return response.json();
        })
        .then((data) => {
          processConsultations(data);
        })
        .catch((error) =>
          console.error("Error fetching consultations:", error)
        );
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
  const getIconByName = (name) => {
    const iconMapping = {
      call: 2,
      video: 3,
      clinic: 4,
      home_visit: 5,
    };

    // Normalize the name to lowercase for case-insensitive matching
    const normalizedName = name.toLowerCase();
    return iconMapping[normalizedName] || 0; // Default to 0 if name doesn't match
  };

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
                    <a className="nav-link">Lab Test</a>
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
                  Home{" "}
                </div>
              </li>
              {/* END DROPDOWN MENU */}
              {/* PAGES */}
              <li aria-haspopup="true">
                <div className="mx-2 navbar-option mt-3">
                  Pages <IoMdArrowDropdown />
                  {/* <span className="wsarrow" /> */}
                </div>
                <div className="wsmegamenu clearfix">
                  <div className="container">
                    <div className="row">
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        {/* <li className="title">Standard Pages:</li> */}
                        <li>
                          <Link legacyBehavior href="/about-us">
                            <a>About Us</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/who-we-are">
                            <a>Who We Are</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/all-services">
                            <a>Our Services</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/service-1">
                            <a>Contact Us</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="#">
                            <a>Join Us</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        {/* <li className="title">Medical Pages:</li> */}
                        <li>
                          <Link legacyBehavior href="/all-departments">
                            <a>Our Departments</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/all-doctors">
                            <a>Meet the Doctors</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        {/* <li className="title">Special Pages:</li> */}
                        <li>
                          <Link legacyBehavior href="/pricing-1">
                            <a>Pricing Packages #1</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/pricing-2">
                            <a>Pricing Packages #2</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/appointment">
                            <a>Make an Appointment</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/faqs">
                            <a>FAQs Page</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/terms">
                            <a>Terms of Use</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        {/* <li className="title">Auxiliary Pages:</li> */}
                        <li>
                          <Link legacyBehavior href="/gallery">
                            <a>Our Gallery</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-listing">
                            <a>Blog Listing Page</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/single-post">
                            <a>Single Blog Post</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/contacts-2">
                            <a>Contact Us #2</a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    {/* End row */}
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
