import React, { useState } from "react";
import Link from "next/link";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineFace3,
  MdPregnantWoman,
} from "react-icons/md";
import {
  FaStethoscope,
  FaTooth,
  FaMedkit,
  FaUserNurse,
  FaHeart,
  FaFemale,
  FaBaby,
  FaEye,
} from "react-icons/fa";
import {
  GiErlenmeyer,
  GiKneeCap,
  GiMedicinePills,
  GiMedicines,
} from "react-icons/gi";
import { BiInjection } from "react-icons/bi";
import { color_schema, services } from "../../constant";
import { FaHeartPulse } from "react-icons/fa6";
import { BsLungsFill } from "react-icons/bs";
import { TbPhysotherapist } from "react-icons/tb";
import { RiTeamFill } from "react-icons/ri";

const Demo5Services2 = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Dummy data for services

  // Calculate the index of the first service to be displayed on the current page
  const indexOfFirstService = (currentPage - 1) * servicesPerPage;

  // Get the services to be displayed on the current page
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfFirstService + servicesPerPage
  );

  // Function to handle clicking on the next page arrow
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Function to handle clicking on the previous page arrow
  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // Function to handle clicking on an icon
  const handleIconClick = (index) => {
    const currentIndex = indexOfFirstService + index;
    // Navigate to the corresponding component based on the index
    const serviceName = services[currentIndex];
    history.push(`/department-single/${serviceName}`);
  };

  // Function to render the icon based on the index
  const renderIcon = (index) => {
    const currentIndex = indexOfFirstService + index;
    if (currentIndex < 8) {
      switch (currentIndex) {
        case 0:
          return (
            <FaStethoscope
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 1:
          return (
            <FaBaby
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 2:
          return (
            <FaHeartPulse
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 3:
          return (
            <MdOutlineFace3
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 4:
          return (
            <GiKneeCap
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 5:
          return (
            <MdPregnantWoman
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 6:
          return (
            <FaEye
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 7:
          return (
            <BsLungsFill
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        default:
          return null;
      }
    } else {
      switch (currentIndex) {
        case 8:
          return (
            <FaMedkit
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 9:
          return (
            <FaTooth
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 10:
          return (
            <TbPhysotherapist
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 11:
          return (
            <BiInjection
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 12:
          return (
            <FaUserNurse
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 13:
          return (
            <GiMedicines
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 14:
          return (
            <GiErlenmeyer
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 15:
          return (
            <FaStethoscope
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        case 16:
          return (
            <RiTeamFill
              size={80}
              color={
                hoveredIndex === index ? "#fafafa" : `${color_schema.green}`
              }
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <section
      id="services-2"
      className="bg-lightgrey wide-70 services-section division"
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <h3 className="h3-md steelblue-color">Our Speciality</h3>
          </div>
        </div>
        <div className="row align-items-center">
          <div className="col-auto" style={{ marginBottom: 44 }}>
            {/* Previous Page Arrow */}
            {currentPage > 1 && (
              <MdKeyboardDoubleArrowLeft
                size={32}
                color="#8e8333"
                onClick={prevPage}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
          <div className="col" style={{ overflowX: "auto" }}>
            <div className="row">
              {/* Render current services */}
              {currentServices.map((service, index) => (
                <div className="col-sm-6 col-lg-3 mb-2" key={index}>
                  <div
                    className="service-nav-link sbox-2 w-100 h-100 py-4"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(index)}
                    onTouchEnd={() => setHoveredIndex(null)}
                  >
                    <Link legacyBehavior href="/department-single">
                      <a onClick={() => handleIconClick(index)}>
                        {/* Render icon */}
                        {renderIcon(index)}
                        {/* Service title */}
                        <h5
                          className="h5-sm sbox-2-title"
                          style={{ color: `${color_schema.green}` }}
                        >
                          {service}
                        </h5>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-auto" style={{ marginBottom: 44 }}>
            {/* Next Page Arrow */}
            {services.length > indexOfFirstService + servicesPerPage && (
              <MdKeyboardDoubleArrowRight
                size={32}
                onClick={nextPage}
                color="#8e8333"
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo5Services2;
