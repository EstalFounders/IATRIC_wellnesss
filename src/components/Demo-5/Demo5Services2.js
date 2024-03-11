import React, { useState } from "react";
import Link from "next/link";
import { AiTwotoneHome } from "react-icons/ai";
import {
  FaStethoscope,
  FaTooth,
  FaMedkit,
  FaUserNurse,
  FaHeart,
} from "react-icons/fa";
import { GiKneeCap } from "react-icons/gi";
import {
  MdFaceRetouchingNatural,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineDoubleArrow,
} from "react-icons/md";

const Demo5Services2 = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;

  // Dummy data for services
  const services = [
    "General Physician",
    "Pediatrics",
    "Cardiology",
    "Dermatologist",
    "Orthopaedics",
    "Gynaecology",
    "Ophthalmology",
    "Pulmonology",
    "Psychiatrist",
    "Dentistry",
    "Physiotherapy",
    "Nursing care",
    "Home care",
    "Medicine Delivery",
    "Lab Investigation",
    "Corporate Healthcare",
    "Healthcamp",
    "Obstetrics",
    // Add more services as needed
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Calculate the index of the first service to be displayed on the current page
  const indexOfFirstService = (currentPage - 1) * servicesPerPage;

  // Calculate the index of the last service to be displayed on the current page
  const indexOfLastService = currentPage * servicesPerPage;

  // Get the services to be displayed on the current page
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  // Function to handle clicking on the next page arrow
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Function to handle clicking on the previous page arrow
  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleIconClick = (index) => {
    // Navigate to the corresponding component based on the index
    const serviceName = services[index];
    history.push(`/department-single/${serviceName}`);
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
            <p>content coming soon</p>
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
                <div className="col-sm-6 col-lg-3" key={index}>
                  <div className="sbox-2">
                    <Link legacyBehavior href="/department-single">
                      <a onClick={() => handleIconClick(index)}>
                        {/* Adjust icons and titles */}
                        {index === 0 && (
                          <FaStethoscope
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 1 && (
                          <MdFaceRetouchingNatural
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 2 && (
                          <GiKneeCap
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 3 && (
                          <FaTooth
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 4 && (
                          <FaHeart
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 5 && (
                          <AiTwotoneHome
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 6 && (
                          <FaMedkit
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 7 && (
                          <FaUserNurse
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}
                        {index === 8 && (
                          <AiTwotoneHome
                            size={80}
                            color={
                              hoveredIndex === index ? "#fafafa" : "#8e8333"
                            }
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        )}

                        <h5 className="h5-sm sbox-2-title steelblue-color">
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
            {services.length > indexOfLastService && (
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
