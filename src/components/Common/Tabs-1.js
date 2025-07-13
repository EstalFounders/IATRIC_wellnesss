import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaArrowAltCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { color_schema } from "../../constant";

const ServicesTabs = () => {
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
      name: "Corporate Health",
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
  const [activeTab, setActiveTab] = useState(services[0]?.id || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;
  const router = useRouter();

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
  };

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

  const boldKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    const escapedKeywords = keywords.map((kw) =>
      kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
    return text
      .split(regex)
      .map((part, i) => (regex.test(part) ? <b key={i}>{part}</b> : part));
  };

  return (
    <section className="custom-tabs-section mt-50">
      <div className="container">
        <div className="tab-nav-wrapper position-relative">
          <div className="arrow left-arrow-fixed" onClick={handlePrevPage}>
            <FaArrowAltCircleLeft size={30} color={color_schema.yellow} />
          </div>

          <div className="tab-buttons-container d-flex justify-content-center align-items-center flex-grow-1">
            {currentServices.map((service) => (
              <div
                key={service.id}
                className={`tab-button service-nav-link text-uppercase mx-1 px-4 ${
                  activeTab === service.id ? "active-tab" : ""
                }`}
                onClick={() => handleTabClick(service.id)}
                style={{
                  width: "280px", // fixed width for consistent layout
                  textAlign: "center",
                  fontSize: "1.1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  // textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
              >
                {service.name}
              </div>
            ))}
          </div>

          <div className="arrow right-arrow-fixed" onClick={handleNextPage}>
            <FaArrowCircleRight size={30} color={color_schema.yellow} />
          </div>
        </div>

        <div className="custom-tab-content mt-5">
          {services
            .filter((service) => service.id === activeTab)
            .map((service) => (
              <div className="row" key={service.id}>
                <div className="col-lg-6">
                  <Image
                    src={service.image}
                    width={500}
                    height={550}
                    alt={service.name}
                    style={{ objectFit: "cover", width: "100%" }}
                  />
                </div>
                <div className="col-lg-6">
                  <h4 className="section-subheading">
                    <span className="section-id blue-color">
                      <h4>{service.subheading}</h4>
                    </span>
                  </h4>
                  <h3
                    className="service-title clickable-div h3-md steelblue-color"
                    onClick={() => handleServiceClick(service.name)}
                  >
                    {service.name}
                  </h3>
                  <div className="service-description h5 box-list grey-color">
                    {boldKeywords(service.description, [
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
                    ])}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesTabs;
