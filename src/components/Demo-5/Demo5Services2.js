import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
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
import { color_schema, services } from "../../constant";
import { handleServiceClick } from "../Common/commonMethod";

const Demo5Services2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const marqueeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const combinedServices = [...services, ...services];

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

  const handleClick = (index) => {
    const serviceName = services[index % services.length];
    handleServiceClick(serviceName, index, router);
  };

  const renderIcon = (index) => {
    const actualIndex = index % services.length;

    switch (actualIndex) {
      case 0:
        return (
          <FaStethoscope
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 1:
        return (
          <FaBaby
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 2:
        return (
          <FaHeartPulse
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 3:
        return (
          <MdOutlineFace3
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 4:
        return (
          <GiKneeCap
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 5:
        return (
          <MdPregnantWoman
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 6:
        return (
          <FaEye
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 7:
        return (
          <BsLungsFill
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 8:
        return (
          <FaMedkit
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 9:
        return (
          <FaTooth
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 10:
        return (
          <TbPhysotherapist
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 11:
        return (
          <BiInjection
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 12:
        return (
          <FaUserNurse
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 13:
        return (
          <GiMedicines
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 14:
        return (
          <GiErlenmeyer
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 15:
        return (
          <FaStethoscope
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      case 16:
        return (
          <RiTeamFill
            size={80}
            color={hoveredIndex === index ? "#fafafa" : color_schema.green}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="services-section pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <h3 className="h3-md steelblue-color">Our Speciality</h3>
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
                {combinedServices.map((service, index) => {
                  const actualIndex = index % services.length;

                  return (
                    <div
                      className="service-card"
                      key={index}
                      onClick={() => handleClick(actualIndex)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="service-nav-link">
                        <div className="service-icon">{renderIcon(index)}</div>
                        <div className="service-title">{service}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Demo5Services2;