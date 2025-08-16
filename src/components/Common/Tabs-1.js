import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { callToBook, color_schema, serviceOffered } from "../../constant";
import { handleServiceClick } from "./commonMethod";
import { servicesData } from "../../../data/services";
import { ConsultationButton } from "./commonUi";
import CalltoBookPopup from "./CalltoBookPopup";

const ServicesTabs = () => {
  const [services] = useState(servicesData);
  const [activeTab, setActiveTab] = useState(services[0]?.id || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;
  const router = useRouter();
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState(false);

  const totalPages = Math.ceil(services.length / servicesPerPage);

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const handleOpenCalltoBookDialog = () => {
    setIsCalltoBookDialog(true);
  };
  const handleCloseCalltoBookDialog = () => {
    setIsCalltoBookDialog(false);
  };

  const handleCalltoBookPopupSubmit = (mobNo) => {
    setMobNo(mobNo);
    setOtpConfirmationPopup(true);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      return prev < totalPages ? prev + 1 : prev;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => {
      return prev > 1 ? prev - 1 : prev;
    });
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

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
          <div
            className={`arrow left-arrow-fixed ${!canGoPrev ? "disabled" : ""}`}
            onClick={canGoPrev ? handlePrevPage : undefined}
            style={{
              opacity: canGoPrev ? 1 : 0.3,
              cursor: canGoPrev ? "pointer" : "not-allowed",
            }}
          >
            <FaArrowAltCircleLeft size={30} color={color_schema.yellow} />
          </div>

          <div className="tab-buttons-container d-flex justify-content-center align-items-center flex-grow-1 p-3">
            {currentServices.map((service) => (
              <div
                key={service.id}
                className={`service-tab ${
                  activeTab === service.id ? "active-tab" : ""
                }`}
                onClick={() => handleTabClick(service.id)}
              >
                {service.name}
              </div>
            ))}
          </div>

          <div
            className={`arrow right-arrow-fixed ${
              !canGoNext ? "disabled" : ""
            }`}
            onClick={canGoNext ? handleNextPage : undefined}
            style={{
              opacity: canGoNext ? 1 : 0.3,
              cursor: canGoNext ? "pointer" : "not-allowed",
            }}
          >
            <FaArrowAltCircleRight size={30} color={color_schema.yellow} />
          </div>
        </div>

        <div className="custom-tab-content mt-5">
          {services
            .filter((service) => service.id === activeTab)
            .map((service) => (
              <div
                className="row align-items-center service-row"
                key={service.id}
              >
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <div className="image-wrapper">
                    <Image
                      onClick={() =>
                        handleServiceClickLocal(service.name, service.id)
                      }
                      className="image"
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 535px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-6 d-flex flex-column justify-content-center text-column">
                  <h4 className="section-subheading blue-color mb-2">
                    {service.subheading}
                  </h4>

                  <h3
                    className="clickable-div h3-md steelblue-color mb-3"
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

                  <div className="service-description h5 box-list grey-color mb-4">
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

                  <div className="mt-5 w-100">
                    <div className="w-50 mx-auto mx-lg-0">
                      <ConsultationButton
                        path={"/appointment"}
                        onClick={() =>
                          handleOpenCalltoBookDialog(
                            serviceOffered.consultation
                          )
                        }
                      >
                        {callToBook}
                      </ConsultationButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <CalltoBookPopup
        show={isCalltoBookDialog}
        onClose={handleCloseCalltoBookDialog}
        onSubmit={handleCalltoBookPopupSubmit}
      />
    </section>
  );
};

export default ServicesTabs;
