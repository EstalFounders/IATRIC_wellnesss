import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ViewDoctorListModel from "../model/ViewDoctorListModel";
import ViewDoctorListComp from "./ViewDoctorListComp";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";
import { color_schema } from "../../constant";

const Tabs1 = () => {
  const [showDoctor, setShowDoctor] = useState(false);
  const doctors = useSelector((state) => state.allDoctorS.allDoctors);
  let filteredDoctors = null;
  // Initialize services with a list of services
  const [services] = useState([
    {
      id: 0,
      name: "General Physician",
      image: "/images/general_physicians.jpg",
      subheading: "Primary Care, Always Accessible",
      description:
        "General Physician: Your Health Partner.Feel better, faster. Our General Physicians provide trusted care for all your health needs. Choose between a convenient online consultation or an in-person visit. We're committed to reaching patients everywhere, making quality healthcare truly accessible. Receive your prescription instantly on your phone after your consultation.",
    },
    {
      id: 1,
      name: "Pediatrics",
      image: "/images/pediatrics.jpg",
      subheading: "Child Health, Expertly Delivered",
      description:
        "Our Pediatrics department is dedicated to the health and wellness of infants, children, and adolescents. We provide compassionate care, growth monitoring, immunizations, and expert guidance for every stage of your child's development.",
    },
    {
      id: 2,
      name: "Cardiology",
      image: "/images/Cardiology_700x700.jpeg",
      subheading: "Heart Wellness, Trusted Monitoring",
      description:
        "Our Cardiology specialists provide advanced care for heart health, offering diagnosis, treatment, and prevention of cardiovascular diseases. We use state-of-the-art technology to ensure accurate assessments and effective management.",
    },
    {
      id: 3,
      name: "Dermatologist",
      image: "/images/dermalogist.jpg",
      subheading: "Skin Solutions, Clinically Proven",
      description:
        "Our Dermatologists offer expert care for all skin, hair, and nail concerns. We provide accurate diagnosis and effective treatments for a wide range of dermatological conditions, helping you achieve healthy and radiant skin.",
    },
    {
      id: 4,
      name: "Orthopaedics",
      image: "/images/orthopedics.jpg",
      subheading: "Mobility Support, Expert Care",
      description:
        "Our Orthopaedics team specializes in the diagnosis and treatment of bone, joint, and muscle disorders. We offer both surgical and non-surgical solutions to restore mobility and relieve pain.",
    },
    {
      id: 5,
      name: "Gynaecology",
      image: "/images/gynecologist.jpg",
      subheading: "Women's Health, Expert Guidance",
      description:
        "Our Gynaecology services cover all aspects of women's health, from adolescence to menopause. We provide preventive screenings, reproductive health care, and expert management of gynecological conditions.",
    },
    {
      id: 6,
      name: "Ophthalmology",
      image: "/images/ophthalmology.jpg",
      subheading: "Vision Care You Can Trust",
      description:
        "Our Ophthalmology department provides comprehensive eye care, from vision testing to advanced treatment of eye diseases. We help you maintain clear vision and healthy eyes at every age.",
    },
    {
      id: 7,
      name: "Pulmonology",
      image: "/images/pulmonology.jpg",
      subheading: "Respiratory Relief, Specialist Care",
      description:
        "Our Pulmonology experts diagnose and treat respiratory and lung conditions, helping you breathe easier. We offer advanced care for asthma, COPD, allergies, and sleep disorders.",
    },
    {
      id: 8,
      name: "Psychiatrist",
      image: "/images/Psychiatrist.jpg",
      subheading: "Mind Wellness, Confidential Support",
      description:
        "Our Psychiatry services provide compassionate mental health care for all ages. We offer diagnosis, counseling, and medication management for a range of mental health conditions.",
    },
    {
      id: 9,
      name: "Dentistry",
      image: "/images/dentistry.jpg",
      subheading: "Dental Care, Patient-Focused",
      description:
        "Our Dentistry team offers comprehensive oral care, from routine cleanings to advanced dental procedures. We focus on preventive care, early diagnosis, and effective treatment for a healthy smile.",
    },
    {
      id: 10,
      name: "Physiotherapy",
      image: "/images/Physiotherapy.jpg",
      subheading: "Rehab Services, Movement Recovery",
      description:
        "Our Physiotherapy services help restore movement and function after injury, surgery, or illness. We design personalized rehabilitation programs to reduce pain and improve mobility.",
    },
    {
      id: 11,
      name: "Nursing care",
      image: "/images/nursing-care.png",
      subheading: "Skilled Support, Compassionate Touch",
      description:
        "Our Nursing Care services provide professional support for patients at home or in clinical settings. We ensure comfort, safety, and expert medical attention for those in need of ongoing care.",
    },
    {
      id: 12,
      name: "Home care",
      image: "/images/home-care.jpeg",
      subheading: "In-Home Medical Assistance",
      description:
        "Our Home Care services bring quality healthcare to your doorstep. We offer medical and non-medical support for patients who prefer the comfort of home.",
    },
    {
      id: 13,
      name: "Medicine Delivery",
      image: "/images/medicine-delivery.jpg",
      subheading: "Quick Access to Medications",
      description:
        "Our Medicine Delivery service ensures you receive your prescriptions quickly and safely at your doorstep. We partner with trusted pharmacies to provide genuine medicines and hassle-free delivery.",
    },
    {
      id: 14,
      name: "Lab Investigation",
      image: "/images/lab-investigation.jpg",
      subheading: "Accurate Results, On Your Schedule",
      description:
        "Our Lab Investigation services offer accurate and timely diagnostic tests for a wide range of health conditions. We use advanced technology to ensure reliable results and support your treatment plan.",
    },
    {
      id: 15,
      name: "Corporate Healthcare",
      image: "/images/corporate-healthcamp.jpg",
      subheading: "Workplace Wellness Simplified",
      description:
        "Our Corporate Healthcare solutions promote employee wellness and productivity. We offer customized health checkups, wellness programs, and on-site medical services for organizations of all sizes.",
    },
    {
      id: 16,
      name: "Healthcamp",
      image: "/images/heatlhcamp.jpg",
      subheading: "Community Checkups & Screenings",
      description:
        "Our Healthcamp services organize community health camps for preventive screenings, health education, and early detection of diseases. We bring healthcare to underserved areas, promoting wellness for all.",
    },
    {
      id: 17,
      name: "Obstetrics",
      image: "/images/Obstetrics.jpg",
      subheading: "Safe Delivery, Expert Care",
      description:
        "Our Obstetrics department provides comprehensive care for women throughout pregnancy, childbirth, and the postpartum period. We are dedicated to ensuring the health and well-being of both mother and baby with personalized attention and advanced medical support.",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;

  const router = useRouter();

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;

  // Slice the services array to get the services for the current page
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const handleServiceClick = (serviceName) => {
    filteredDoctors = doctors.filter((doctor) =>
      doctor.serviceOffered.some(
        (service) => service.toLowerCase() === serviceName.toLowerCase()
      )
    );
    console.log(
      `Filtered doctors for service ${serviceName}:`,
      filteredDoctors
    );
    router.push(
      `/department-single?serviceName=${serviceName
        .toLowerCase()
        .replace(/\s+/g, "-")}`
    );
    // setShowDoctor(true);
    // ${serviceName.toLowerCase().replace(/\s+/g, '-')}
    // Add your logic here for handling the service click
  };

  // Utility function to bold specific keywords in the description
  const boldKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    // Escape special characters for regex
    const escapedKeywords = keywords.map((kw) =>
      kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
    return text
      .split(regex)
      .map((part, i) => (regex.test(part) ? <b key={i}>{part}</b> : part));
  };

  return (
    <section id="tabs-1" className="wide-100 tabs-section division">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Tab.Container defaultActiveKey={`tab-${services[0].id}`}>
              <div id="tabs-nav" className="list-group text-center">
                <Nav
                  className="nav nav-pills justify-content-center"
                  id="pills-tab"
                  as="ul"
                >
                  {currentPage > 1 && (
                    <FaChevronLeft
                      className="nav-icon mt-3 mr-4"
                      onClick={handlePrevPage}
                      color="#8e8333"
                      size={30}
                    />
                  )}
                  {currentServices.map((service, index) => (
                    <Nav.Item className="nav-item icon-xs" key={index} as="li">
                      <Nav.Link
                        className="consultation-btn"
                        style={{ color: `${color_schema.green}` }}
                        eventKey={`tab-${index}`}
                      >
                        <b>{service.name}</b>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                  {indexOfLastService < services.length && (
                    <FaChevronRight
                      className="nav-icon mt-3 mr-4"
                      onClick={handleNextPage}
                      color="#8e8333"
                      size={30}
                    />
                  )}
                </Nav>
              </div>
              <Tab.Content className="tab-content" id="pills-tabContent">
                {currentServices.map((service, index) => (
                  <Tab.Pane
                    className="tab-pane fade"
                    key={index}
                    eventKey={`tab-${index}`}
                  >
                    <div className="row d-flex align-items-start">
                      <div className="col-lg-6 d-flex align-items-start">
                        <div className="tab-img" style={{ width: "100%" }}>
                          <Image
                            width={500}
                            height={550}
                            src={service.image}
                            alt="tab-image"
                            style={{ objectFit: "cover", width: "100%" }}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 d-flex flex-column justify-content-start">
                        <div className="txt-block pc-30">
                          <span className="section-id blue-color">
                            <h4 style={{ marginTop: 0 }}>
                              {service.subheading}
                            </h4>
                          </span>
                          <h3
                            className="h3-md text- clickable-div mb-0"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "#0056b3")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color = "black")
                            }
                            onClick={() => handleServiceClick(service.name)}
                          >
                            {service.name}
                          </h3>
                          <div className="h5 box-list grey-color">
                            {
                              // Pass keywords you want to bold for each service
                              boldKeywords(service.description, [
                                "General Physician",
                                "trusted care",
                                "Pediatrics",
                                "monitoring",
                                "immunizations",
                                "Cardiology",
                                "advanced care",
                                "Dermatologist",
                                "effective treatments",
                                "Orthopaedics",
                                "bone",
                                "joint",
                                "muscle disorders",
                                "Gynaecology",
                                "preventive screenings",
                                "reproductive health care",
                                "Ophthalmology",
                                "comprehensive eye care",
                                "Pulmonology",
                                "respiratory",
                                "lung conditions",
                                "Psychiatrist",
                                "mental health care",
                                "Dentistry",
                                "comprehensive oral care",
                                "Physiotherapy",
                                "restore movement",
                                "Nursing care",
                                "professional support",
                                "Home care",
                                "quality healthcare",
                                "Medicine Delivery",
                                "prescriptions",
                                "Lab Investigation",
                                "diagnostic tests",
                                "Corporate Healthcare",
                                "employee wellness",
                                "Healthcamp",
                                "community health camps",
                                "Obstetrics",
                                "pregnancy",
                                "childbirth",
                                "postpartum period",
                                "personalized attention",
                              ])
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
      <ViewDoctorListModel
        isOpen={showDoctor}
        onClose={() => {
          setShowDoctor(false);
        }}
      >
        <ViewDoctorListComp doctors={filteredDoctors} />
      </ViewDoctorListModel>
    </section>
  );
};

export default Tabs1;
