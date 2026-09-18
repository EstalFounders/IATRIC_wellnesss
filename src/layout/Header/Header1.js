import React, { useEffect, useState, useCallback } from "react";
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
  instagram_page_url,
  Linkdn_url,
  speciality,
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
import { useLanguage } from "../../i18n/LanguageContext";
import { handleServiceClick } from "../../components/Common/commonMethod";
import { demo5ServiceHighlights } from "../../../data/services";

const Header1 = ({ scrollToContact }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const isLabTestPage = router.pathname.includes("/labTest");
  const isMedicinePage = router.pathname.includes("/medicine");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comingSoonItems, setComingSoonItems] = useState(new Set());
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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleComingSoonClick = useCallback((href) => {
    setComingSoonItems((prev) => new Set(prev).add(href));
  }, []);
  
  const isComingSoon = useCallback((href) => comingSoonItems.has(href), [comingSoonItems]);
  
  const updateCartItemCount = (count) => setCartItemCount(count);
  const toggleMedicinePanel = () => setIsMedicinePanelOpen(!isMedicinePanelOpen);
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
            onClick={() => toggleMobileMenu()}
            aria-label={t("nav.openMenu")}
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
            {t("common.bookNow")}
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
                  <span><FaMapMarkedAlt className="mx-1" /><b style={{ fontWeight: "bold", fontSize: 16 }}>{t("footer.address", address)}</b></span>
                </a>
              </span>
              <a href={`tel:${contact_no}`} className="callusbtn">
                <FaPhoneVolume className="mx-1" /><b style={{ fontWeight: "bold", fontSize: 16 }}>{contact_no}</b>
              </a>
            </div>
          </div>
          <div className="headertopright">
            <a className="linkedinicon" title="Linkedin" target="blank" href={Linkdn_url}><FaLinkedin size={25} /><span className="mobiletext02">Linkedin</span></a>
            <a className="instagramicon" title="Instagram" target="blank" href={instagram_page_url}><FaInstagram size={25} /><span className="mobiletext02">Instagram</span></a>
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
                  <li><Link legacyBehavior href="/"><a className="nav-link">{t("nav.home")}</a></Link></li>
                  {/* OUR SPECIALITY */}
                  <li aria-haspopup="true">
                    <a href="#">{t("nav.ourSpeciality")} <span className="wsarrow" /></a>
                    <div className="wsmegamenu clearfix">
                      <div className="container">
                        <div className="row">
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title">{t("footer.quickLinks")}:</li>
                            {speciality.slice(0, 6).map((name, index) => (
                              <li key={name}>
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleServiceClick(name, index, router);
                                  }}
                                >
                                  {name}
                                </a>
                              </li>
                            ))}
                          </ul>
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title" style={{ visibility: "hidden" }}>{t("footer.quickLinks")}:</li>
                            {speciality.slice(6).map((name, index) => (
                              <li key={name}>
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleServiceClick(name, index + 6, router);
                                  }}
                                >
                                  {name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  {/* END OUR SPECIALITY */}
                  {/* SERVICES */}
                  <li aria-haspopup="true">
                    <a href="#">{t("nav.servicesMenu")} <span className="wsarrow" /></a>
                    <div className="wsmegamenu clearfix">
                      <div className="container">
                        <div className="row">
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title">{t("footer.quickLinks")}:</li>
                            {demo5ServiceHighlights.slice(0, 4).map((service) => (
                              <li key={service.title}>
                                <Link legacyBehavior href={`/service-details/?Service=${service.service}`}>
                                  <a>{service.title}</a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title" style={{ visibility: "hidden" }}>{t("footer.quickLinks")}:</li>
                            {demo5ServiceHighlights.slice(4).map((service) => (
                              <li key={service.title}>
                                <Link legacyBehavior href={`/service-details/?Service=${service.service}`}>
                                  <a>{service.title}</a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  {/* END SERVICES */}
                  <li aria-haspopup="true">
                    <a href="#">{t("nav.pages")} <span className="wsarrow" /></a>
                    <div className="wsmegamenu clearfix">
                      <div className="container">
                        <div className="row">
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title">{t("footer.quickLinks")}:</li>
                            <li><Link legacyBehavior href="/about-us"><a>{t("nav.aboutUs")}</a></Link></li>
                            <li><Link legacyBehavior href="/all-services"><a>{t("nav.services")}</a></Link></li>
                            <li><Link legacyBehavior href="/appointment"><a>{t("nav.bookConsultation")}</a></Link></li>
                          </ul>
                          <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                            <li className="title" style={{ visibility: "hidden" }}>{t("footer.quickLinks")}:</li>
                            <li>
                              <span
                                onClick={() => handleComingSoonClick("/medicine/homepage")}
                                style={{ cursor: "pointer", display: "block", lineHeight: "18px", padding: "15px 0px", fontSize: "15px", fontWeight: 400, color: isComingSoon("/medicine/homepage") ? "#8e8333" : "#888" }}
                              >
                                {isComingSoon("/medicine/homepage") ? t("nav.medicinesSoon") : t("nav.medicines")}
                              </span>
                            </li>
                            <li><Link legacyBehavior href="/all-doctors"><a>{t("nav.allDoctors")}</a></Link></li>
                            <li><Link legacyBehavior href="/join-us"><a>{t("nav.joinUs")}</a></Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li><Link legacyBehavior href="/contacts-2"><a className="nav-link">{t("nav.contactUs")}</a></Link></li>
                </ul>
              </nav>
            <div className="d-flex align-items-center gap-3">
              {!hiddenRoutes.includes(router.pathname) && (
                <ConsultationButton onClick={handleConsultationTypeOpenDialog}>{t("common.bookNow")}</ConsultationButton>
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

      {mobileMenuOpen && <MobileMenu isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />}
    </header>
  );
};

export default Header1;