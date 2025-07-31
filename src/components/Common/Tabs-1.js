import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaArrowAltCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { color_schema } from "../../constant";
import { handleServiceClick } from "./commonMethod";
import { servicesData } from "../../../data/services";
import { ConsultationButton } from "./commonUi";

const ServicesTabs = () => {
  // Initialize services with a list of services
  const [services] = useState(servicesData);
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

  const handleServiceClickLocal = (serviceName, id) => {
    handleServiceClick(serviceName, id, router);
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
                className={`tab-button text-uppercase mx-1 px-4 ${
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
                    onClick={() =>
                      handleServiceClickLocal(service.name, service.id)
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = `${color_schema.yellow}`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = `#000000`)
                    }
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
                  <div className="mt-5 mr-auto">
                    <div className="w-50">
                      <ConsultationButton path={"/appointment"}>
                        Book Consultation
                      </ConsultationButton>
                    </div>
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
