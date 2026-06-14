import React, { useEffect, useState } from "react";
import Link from "next/link";
import MobileMenu from "../MobileMenu";
import { IoMenu } from "react-icons/io5";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkedAlt, FaPhoneVolume } from "react-icons/fa";
import {
  address,
  booking_btn_txt,
  color_schema,
  contact_no,
  facebook_page_url,
} from "../../constant";
import { useRouter } from "next/router";
import Image from "next/image";
import { ConsultationButton } from "../../components/Common/commonUi";
import { FaCartShopping } from "react-icons/fa6";
import CartPanel from "../../components/labTestComponent/common/CartPanel";
import MedicineCartPanel from "../../components/medicines/common/MedicineCartPanel";
import { getMedicineCartItems } from "../../components/medicines/common/CommonMethod";
import { getLabTestCartItems } from "../../components/labTestComponent/common/CommonMethod";
import { fetchConsultations } from "../../components/ApiService/UtilService";
import { useDispatch, useSelector } from "react-redux";

const Header1 = ({ scrollToContact }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLabTestPage = router.pathname.includes("/labTest");
  const isMedicinePage = router.pathname.includes("/medicine");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const consultationTypes = useSelector(
    (state) => state.otherConfigSlice.activeConsultation,
  );
  const hiddenRoutes = ["/appointment", "/some-other-route"];

  const [medicineCartItems, setMedicineCartItems] = useState(getMedicineCartItems());
  const [labTestCartItems, setLabTestCartItems] = useState(getLabTestCartItems());
  const [cartItemCount, setCartItemCount] = useState(labTestCartItems.length);
  const [medicineCartItemCount, setMedicineCartItemCount] = useState(medicineCartItems.length);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMedicinePanelOpen, setIsMedicinePanelOpen] = useState(false);

  const handleConsultationTypeOpenDialog = () => {
    router.push(`/appointment?service=${encodeURIComponent("Book_Consultation")}`);
  };

  const togglePanel = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleMedicinePanel = () => setIsMedicinePanelOpen(!isMedicinePanelOpen);
  const updateCartItemCount = (count) => setCartItemCount(count);
  const updateMedicineCartItemCount = (count) => setMedicineCartItemCount(count);

  useEffect(() => {
    if (!consultationTypes || consultationTypes.length === 0) {
      fetchConsultations(dispatch);
    }
  }, []);

  return (
    <header id="header" className="header">
      {/* MOBILE HEADER — this div uses CSS class wsmobileheader which is hidden on desktop (>991px) via menu.css */}
      <div className="wsmobileheader clearfix">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", gap: 10 }}>
          <button
            onClick={() => togglePanel()}
            aria-label="Open menu"
            style={{
              background: "#3b5f1d",
              border: "none",
              borderRadius: 8,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <IoMenu size={22} color="white" />
          </button>

          <span className="smllogo" style={{ display: "flex", alignItems: "center" }}>
            <img src="images/logo.png" width={140} height={42} alt="mobile-logo" style={{ objectFit: "contain" }} />
          </span>

          <ConsultationButton onClick={handleConsultationTypeOpenDialog} style={{ fontSize: "0.8rem", padding: "6px 14px", whiteSpace: "nowrap" }}>
            {booking_btn_txt}
          </ConsultationButton>
        </div>
      </div>

      {/* HEADER STRIP */}
      <div className="headtoppart clearfix" style={{ backgroundColor: "#3b5f1d" }}>
        <div className="headerwp clearfix">
          <div className="headertopleft">
            <div className="address clearfix">
              <span>
                <a href="https://www.google.com/maps/search/?api=1&query=Sector%2057%20Gurgaon%20Haryana%20122003" target="_blank" rel="noopener noreferrer">
                  <span><FaMapMarkedAlt className="mx-1" /><b style={{ fontWeight: "bold", fontSize: 16 }}>{address}</b></span>
                </a>
              </span>
              <a href={`tel:${contact_no}`} className="callusbtn">
                <FaPhoneVolume className="mx-1" /><b style={{ fontWeight: "bold", fontSize: 16 }}>{contact_no}</b>
              </a>
            </div>
          </div>
          <div className="headertopright">
            <a className="linkedinicon" title="Linkedin" target="blank" href="https://www.linkedin.com/in/iatrichealthcare/"><FaLinkedin size={25} /><span className="mobiletext02">Linkedin</span></a>
            <a className="instagramicon" title="Instagram" target="blank" href="https://www.instagram.com/iatric.healthcare/"><FaInstagram size={25} /><span className="mobiletext02">Instagram</span></a>
            <a className="facebookicon" title="Facebook" target="blank" href={facebook_page_url}><FaFacebook size={25} /><span className="mobiletext02">Facebook</span></a>
          </div>
        </div>
      </div>

      {/* DESKTOP NAVIGATION */}
      <div className="wsmainfull menu clearfix">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <a href="#">
                <Image src="/images/logo.png" width={180} height={60} alt="header-logo" />
              </a>
            </div>
            <nav className="wsmenu">
              <ul className="wsmenu-list font-weight-bold d-flex gap-4 mb-0">
                <li><Link legacyBehavior href="/"><a className="nav-link">Home</a></Link></li>
                <li aria-haspopup="true">
                  <a href="#">Pages <span className="wsarrow" /></a>
                  <div className="wsmegamenu clearfix">
                    <div className="container">
                      <div className="row">
                        <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                          <li className="title">Standard Pages:</li>
                          <li><Link legacyBehavior href="/about-us"><a>About Us</a></Link></li>
                          <li><Link legacyBehavior href="/who-we-are"><a>Who We Are</a></Link></li>
                          <li><Link legacyBehavior href="/all-services"><a>Our Services</a></Link></li>
                          <li><Link legacyBehavior href="/service-1"><a>Contact Us</a></Link></li>
                          <li><Link legacyBehavior href="/join-us"><a>Join Us</a></Link></li>
                        </ul>
                        <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                          <li className="title">Medical Pages:</li>
                          <li><Link legacyBehavior href="/all-departments"><a>Our Departments</a></Link></li>
                          <li><Link legacyBehavior href="/department-single"><a>Department Single</a></Link></li>
                          <li><Link legacyBehavior href="/all-doctors"><a>Meet the Doctors</a></Link></li>
                        </ul>
                        <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                          <li className="title">Special Pages:</li>
                          <li><Link legacyBehavior href="/pricing-1"><a>Pricing Packages #1</a></Link></li>
                          <li><Link legacyBehavior href="/pricing-2"><a>Pricing Packages #2</a></Link></li>
                          <li><Link legacyBehavior href="/appointment"><a>Make an Appointment</a></Link></li>
                          <li><Link legacyBehavior href="/faqs"><a>FAQs Page</a></Link></li>
                        </ul>
                        <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                          <li className="title">Auxiliary Pages:</li>
                          <li><Link legacyBehavior href="/gallery"><a>Our Gallery</a></Link></li>
                          <li><Link legacyBehavior href="/blog-listing"><a>Blog Listing Page</a></Link></li>
                          <li><Link legacyBehavior href="/single-post"><a>Single Blog Post</a></Link></li>
                          <li><Link legacyBehavior href="/contacts-2"><a>Contact Us #2</a></Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
                <li><Link legacyBehavior href="/labTest/homepage"><a className="nav-link" target="_blank" rel="noopener noreferrer">Lab Test</a></Link></li>
                <li><Link legacyBehavior href="/blog/homepage"><a className="nav-link" target="_blank">Blog</a></Link></li>
                <li><Link legacyBehavior href="/service-1"><a className="nav-link">Contact Us</a></Link></li>
              </ul>
            </nav>
            <div className="d-flex align-items-center gap-3">
              {!hiddenRoutes.includes(router.pathname) && (
                <ConsultationButton onClick={handleConsultationTypeOpenDialog}>{booking_btn_txt}</ConsultationButton>
              )}
              {isLabTestPage && cartItemCount > 0 && (
                <div className="position-relative" onClick={togglePanel} role="button">
                  <FaCartShopping size={20} color={color_schema.green} />
                  <div className="cartItemCount position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">{cartItemCount}</div>
                </div>
              )}
              {isMedicinePage && medicineCartItemCount > 0 && (
                <div className="position-relative" onClick={toggleMedicinePanel} role="button">
                  <FaCartShopping size={20} color={color_schema.green} />
                  <div className="cartItemCount position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">{medicineCartItemCount}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {isLabTestPage && <CartPanel isOpen={isPanelOpen} togglePanel={togglePanel} cartItem={labTestCartItems} onUpdateCartItemCount={updateCartItemCount} />}
        {isMedicinePage && <MedicineCartPanel isOpen={isMedicinePanelOpen} togglePanel={toggleMedicinePanel} cartItem={medicineCartItems} onUpdateCartItemCount={updateMedicineCartItemCount} />}
      </div>

      {mobileMenuOpen && <MobileMenu  scrollToContact={scrollToContact} />}
    </header>
  );
};

export default Header1;