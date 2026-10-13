import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import {
  booking_btn_txt,
  callToBook,
  color_schema,
  serviceOffered,
} from "../../constant";
import { handleServiceClick } from "./commonMethod";
import { ConsultationButton } from "./commonUi";
import CalltoBookPopup from "./CalltoBookPopup";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  getServiceAsset,
  slugifyService,
  useGlobalData,
} from "../../customUtils/useGlobalData";

// Fallback artwork for a serviceOffered document without an `image`.
const DEFAULT_SERVICE_IMAGE = "/images/general_physicians.jpg";

// `image` accepts a path ("/images/x.jpg", "images/x.jpg" or just "x.jpg") or a
// hosted url. Remote urls skip the optimizer because next.config.js only
// whitelists the firebase host.
const resolveServiceImage = (image) => {
  const value = String(image || "").trim();
  if (!value) return DEFAULT_SERVICE_IMAGE;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return value.startsWith("/") ? value : `/images/${value}`;
};

const isRemoteImage = (image) => /^(https?:)?\/\//i.test(String(image || ""));

// A serviceOffered document carries one copy per language; fall back to the other
// language so a missing Hindi (or English) value never renders an empty panel.
const localizedServiceText = (isHindi, english, hindi) =>
  String((isHindi ? hindi : english) || (isHindi ? english : hindi) || "").trim();

const ServicesTabs = () => {
  // Every rendered field comes from the serviceOffered API (globalData slice -> SUB
  // items): name, image, subheading (+ Hi) and description (+ Hi) are stored per
  // document, so the panel needs no static service list anymore.
  const { speciality } = useGlobalData();
  const services = useMemo(
    () =>
      speciality.map((item) => {
        const asset = getServiceAsset(item.name);
        return {
          ...item,
          id: item.id ?? slugifyService(item.name),
          subheading: item.subheading || asset?.subheading || "",
          description: item.description || asset?.description || "",
          image: resolveServiceImage(item.image || asset?.image),
        };
      }),
    [speciality]
  );
  const [activeTab, setActiveTab] = useState(services[0]?.id || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [brokenImages, setBrokenImages] = useState({});
  const servicesPerPage = 4;
  const router = useRouter();
  const { t, lang } = useLanguage();
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

  // Keep the active tab valid when the slice replaces the static list (DB-only
  // items carry slug ids, matched static items keep their numeric id).
  useEffect(() => {
    if (services.length && !services.some((service) => service.id === activeTab)) {
      setActiveTab(services[0].id);
    }
  }, [services, activeTab]);

  const handleTabClick = (id) => {
    setActiveTab(id);
  };

  const handleServiceClickLocal = (serviceName, id) => {
    handleServiceClick(serviceName, id, router);
  };

  const isHindi = lang === "hi";

  // Description + subheading are rendered straight from the serviceOffered document
  // (admin copy), with no i18n/static fallback: an empty document simply hides the line.
  const renderDescription = (service) =>
    localizedServiceText(
      isHindi,
      service.description,
      service.descriptionHi
    ) || null;

  const renderSubheading = (service) => {
    const text = localizedServiceText(
      isHindi,
      service.subheading,
      service.subheadingHi
    );
    if (!text) return null;
    return (
      <h4
        className="section-subheading blue-color mb-3"
        style={{ fontSize: "1.8rem", fontWeight: "600" }}
      >
        {text}
      </h4>
    );
  };

  if (!services.length) {
    return (
      <section className="custom-tabs-section mt-50 pb-100">
        <div className="container">
          <p className="text-center grey-color mb-0">Loading services…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="custom-tabs-section mt-50 pb-100">
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
                {t(`service.${service.name}`, service.name)}
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
                {/* Left Column - Image */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <div className="image-wrapper position-relative">
                    <Image
                      onClick={() =>
                        handleServiceClickLocal(service.name, service.id)
                      }
                      className="image"
                      src={
                        brokenImages[service.id]
                          ? DEFAULT_SERVICE_IMAGE
                          : service.image
                      }
                      alt={service.name}
                      fill
                      unoptimized={isRemoteImage(
                        brokenImages[service.id]
                          ? DEFAULT_SERVICE_IMAGE
                          : service.image
                      )}
                      sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 535px"
                      style={{ objectFit: "cover" }}
                      onError={() =>
                        setBrokenImages((prev) =>
                          prev[service.id]
                            ? prev
                            : { ...prev, [service.id]: true }
                        )
                      }
                    />
                  </div>
                </div>

                {/* Right Column - Text */}
                <div className="col-lg-6 d-flex flex-column justify-content-center text-column">
                  {/* Subheading */}
                  {renderSubheading(service)}

                  {/* Heading */}
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
                    style={{ fontWeight: "700" }}
                  >
                    {t(`service.${service.name}`, service.name)}
                  </h3>

                  {/* Description — rendered from the serviceOffered description */}
                  <div
                    className="service-description h5 box-list grey-color mb-4"
                    style={{ lineHeight: "1.6" }}
                  >
                    {renderDescription(service)}
                  </div>

                  {/* Call to Book Button */}
                  <div className="mt-4 w-100">
                    <div className="w-50 mx-auto mx-lg-0">
                      <ConsultationButton
                        variant={"book-now"}
                        path={"/appointment"}
                        onClick={() =>
                          handleOpenCalltoBookDialog(
                            serviceOffered.consultation
                          )
                        }
                      >
                        {booking_btn_txt}
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
