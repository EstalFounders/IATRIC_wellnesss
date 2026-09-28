import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  FaStethoscope,
  FaTooth,
  FaMedkit,
  FaUserNurse,
  FaBaby,
  FaEye,
} from "react-icons/fa";
import { FaHeartPulse } from "react-icons/fa6";
import { MdOutlineFace3, MdPregnantWoman } from "react-icons/md";
import { GiKneeCap, GiMedicines, GiErlenmeyer } from "react-icons/gi";
import { BsLungsFill } from "react-icons/bs";
import { BiInjection } from "react-icons/bi";
import { TbPhysotherapist } from "react-icons/tb";
import { RiTeamFill } from "react-icons/ri";
import { color_schema } from "../../constant";
import { useGlobalData } from "../../customUtils/useGlobalData";
import { getServiceDescription } from "../../customUtils/serviceLinks";
import { handleServiceClick } from "../Common/commonMethod";
import {
  CardiologyIcon,
  Dentistry,
  DermatologistIcon,
  GeneralPhysician,
  GynaecologyIcon,
  OphthalmologyIcon,
  OrthopaedicsIcon,
  PediatricsIcon,
  PhysiotherapyIcon,
  Psychiatrist,
  PulmonologyIcon,
} from "../../../public/svgIcon/all-department-svg-icon";

// Name -> icon map so reordering or adding specialities in the DB can never
// shift the wrong icon onto a card (previously index-based).
const ICON_BY_NAME = {
  "general physician": GeneralPhysician,
  pediatrics: PediatricsIcon,
  cardiology: CardiologyIcon,
  dermatologist: DermatologistIcon,
  dermatology: DermatologistIcon,
  orthopaedics: OrthopaedicsIcon,
  "gynaecology & obstetrics": GynaecologyIcon,
  gynecology: GynaecologyIcon,
  ophthalmology: OphthalmologyIcon,
  pulmonology: PulmonologyIcon,
  psychiatrist: Psychiatrist,
  psychiatry: Psychiatrist,
  dentistry: Dentistry,
  physiotherapy: PhysiotherapyIcon,
  // service-type names (used if a MAJOR item is ever rendered here)
  labtest: GiErlenmeyer,
  "lab investigation": GiErlenmeyer,
  "nursing care": FaUserNurse,
  "nursing-services": FaUserNurse,
  "home care": RiTeamFill,
  "medicine delivery": GiMedicines,
  "corporate healthcare": RiTeamFill,
  healthcamp: FaStethoscope,
  audio: FaStethoscope,
  video: FaStethoscope,
  vaccination: BiInjection,
  injection: BiInjection,
};

const Demo5Services2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const marqueeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // Single source of truth: globalData slice (serviceOffered SUB items). The whole
  // objects (not just the names) so each card can render its own description.
  const { speciality } = useGlobalData();

  useEffect(() => {
    const el = marqueeRef.current;
    let startX, scrollLeft;

    const onTouchStart = (e) => {
      startX = e.touches[0].pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onTouchMove = (e) => {
      const x = e.touches[0].pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const combinedServices = [...speciality, ...speciality];

  // Mouse Events
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll-fast factor
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleClick = (item, index) => {
    if (!item?.name) return;
    handleServiceClick(item.name, index, router);
  };

  const renderIcon = (name, index) => {
    const Icon = ICON_BY_NAME[String(name || "").toLowerCase()] || FaStethoscope;
    return (
      <Icon
        size={80}
        color={hoveredIndex === index ? "#fafafa" : color_schema.green}
      />
    );
  };

  return (
    <section className="services-section pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <div className="font-weight-bold h1 text-uppercase">{t("demo5.services2.heading")}</div>
          </div>
        </div>
        <div className="row">
          <section className="col-lg-12">
            <div
              className="services-marquee"
              ref={marqueeRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={(e) => {
                setIsPaused(false);
                handleMouseLeave(e);
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div className={`services-track ${isPaused ? "paused" : ""}`}>
                {combinedServices.map((item, index) => (
                  <div
                    className="service-card"
                    key={index}
                    onClick={() => handleClick(item, index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="service-nav-link">
                      <div className="service-icon">
                        {renderIcon(item.name, index)}
                      </div>
                      <div className="service-title font-weight-bold">
                        {t(`service.${item.name}`, item.name)}
                      </div>
                      <div className="service-card-desc">
                        {item.description || getServiceDescription(item.name)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Demo5Services2;
