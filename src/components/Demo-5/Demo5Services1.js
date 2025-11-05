import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { color_schema } from "../../constant";
import {
  CorporateHealthcareIcon,
  GeneralPhysician,
  HealthCampIcon,
  HomeCareIcon,
  LabInvestigation,
} from "../../../public/svgIcon/all-department-svg-icon";

const Demo5Services1 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const marqueeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ✅ Duplicate your `features[]` array locally
  const features = [
    {
      title: "docctor Consultation",
      service: "Consultation",
      description:
        "Connect instantly with top-rated doctors for personalized medical consultations, expert health advice, and tailored treatment plans to improve your well-being.",
      icon: <GeneralPhysician size={70} />,
      btntext: "View Details",
    },
    {
      title: "Home Care",
      service: "home care",
      description:
        "Receive professional healthcare and medical support at home, including nursing, therapy, and wellness services, ensuring comfort and convenience for you and your family.",
      icon: <HomeCareIcon size={70} />,
      btntext: "View Details",
    },
    {
      title: "Lab Test and dignostics",
      service: "lab-test",
      description:
        "Access advanced treatments and specialized medical care from experienced healthcare professionals, designed to meet your unique health needs and conditions.",
      icon: <LabInvestigation size={70} />,
      btntext: "View Details",
    },
    {
      title: "Community Care",
      service: "corporate",
      description:
        "Enhance employee well-being and productivity with comprehensive corporate healthcare solutions, including health screenings, wellness programs, and medical support for organizations.",
      icon: <HealthCampIcon size={70} />,
      btntext: "View Details",
    },
    {
      title: "Corporate Healthcare",
      service: "corporate-healthcare",
      description:
        "Enhance employee well-being and productivity with comprehensive corporate healthcare solutions, including health screenings, wellness programs, and medical support for organizations.",
      icon: <CorporateHealthcareIcon size={70} />,
      btntext: "View Details",
    },
  ];

  // ✅ Duplicate for infinite scroll
  const combinedFeatures = [...features, ...features];

  // ✅ Touch support
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

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

  // ✅ Mouse drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  // ✅ Click redirect
  const handleClick = (item) => {
    router.push(`/service-details/?Service=${item.title.trim()}`);
  };

  return (
    <section className="services-section pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <div className="font-weight-bold display-4">Patient Services</div>
          </div>
        </div>

        <div className="row">
          <section className="services-wrapper col-lg-12">
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
              <div className={`services-track-rtl ${isPaused ? "paused" : ""}`}>
                {combinedFeatures.map((item, index) => (
                  <div
                    className="service-card"
                    key={index}
                    onClick={() => handleClick(item)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="service-nav-link-dept">
                      <div className="service-icon-dept">{item.icon}</div>
                      <div className="service-title-dept font-weight-bold">{item.title}</div>
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

export default Demo5Services1;
