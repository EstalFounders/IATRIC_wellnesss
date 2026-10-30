import Image from "next/image";
import React from "react";
import { color_schema, imageBlurDataUrl } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useRouter } from "next/router";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  getServiceDescription,
  LAB_SERVICE_KEY,
  LAB_SERVICE_NAME,
  serviceDetailsPath,
} from "../../customUtils/serviceLinks";
import {
  CorporateHealthcareIcon,
  GeneralPhysician,
  HealthCampIcon,
  HomeCareIcon,
  LabInvestigation,
  MedicineDelivery,
  NursingCareIcon,
  PhysiotherapyIcon,
} from "../../../public/svgIcon/all-department-svg-icon";

const DiscoverMoreComp = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const features = [
    {
      title: t("dm.title.doctor"),
      service: "consultation",
      description:
        t("dm.desc.doctor"),
      icon: <GeneralPhysician color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    {
      title: t("dm.title.nursing"),
      service: "nursing-services",
      description:
        t("dm.desc.nursing"),
      icon: <NursingCareIcon color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    {
      // Merged "Labtest" / "Lab Investigation" service - one card, one name.
      title: LAB_SERVICE_NAME,
      service: LAB_SERVICE_KEY,
      comingSoon: true,
      description: getServiceDescription(LAB_SERVICE_NAME),
      icon: <LabInvestigation color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    // {
    //   title: "Medicine Delivery",
    //   service: "community",
    //   description:
    //     "Join community wellness programs and health initiatives that promote healthy living, disease prevention, and overall well-being for individuals and families.",
    //   icon: <MedicineDelivery color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
    //   btntext: t("dm.viewDetails"),
    // },
    {
      title: t("dm.title.community"),
      service: "community-care",
      description:
        t("dm.desc.community"),
      icon: <HealthCampIcon color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    {
      title: t("dm.title.corporate"),
      // Linked to its own content block so the CTA is not a dead end.
      service: "corporate-healthcare",
      description: t("dm.desc.corporate"),
      icon: (
        <CorporateHealthcareIcon color={`${color_schema.yellow}`} size={70} />
      ), // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    {
      title: t("dm.title.home"),
      // Home care has its own content block (separate branch from nursing care).
      service: "home-care",
      description:
        t("dm.desc.home"),
      icon: (
        <HomeCareIcon color={`${color_schema.yellow}`} size={70} />
      ), // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
    {
      title: t("dm.title.physio"),
      description:
        t("dm.desc.physio"),
      icon: (
        <PhysiotherapyIcon color={`${color_schema.yellow}`} size={70} />
      ), // Using the SVG icon component
      btntext: t("dm.viewDetails"),
    },
  ];

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">
          <u>{t("banner.Discover More")}</u>
        </h1>
        <span className="section-id blue-color mt-5">
          <h5>{t("discovermore.sub")}</h5>
        </span>
        <div className="h5 box-list grey-color">{t("discovermore.intro")}</div>
      </div>

      <div className="row g-4 justify-content-center">
        {features.map((item, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-4 p-4">
            <div
              className="h-100 shadow-sm border-0 text-center p-4"
              style={{ borderRadius: "10px", minWidth: "320px" }}
            >
              {/* Floating Icon */}
              <div
                className="position-absolute top-0 start-50 translate-middle"
                style={{
                  width: "120px",
                  height: "120px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  marginTop: "-50px",
                }}
              >
                {/* <Image
                  placeholder="blur"
                  blurDataURL={imageBlurDataUrl}
                  src={item.icon}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="img-fluid"
                /> */}
                {item.icon}
              </div>

              {/* Card Content */}
              <div className="pt-5 mt-4">
                <div className="h5 mt-3 font-weight-bold">{item.title}</div>
                {/* Fixed band reserved on every card, so the optional "Coming
                    Soon" pill can never stretch one card (and push its CTA out
                    of line with the other cells in the same row). */}
                <div className="service-coming-soon-slot">
                  {item.comingSoon ? (
                    <div className="service-coming-soon">
                      {t("common.comingSoon")}
                    </div>
                  ) : null}
                </div>
                <hr
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.3)",
                    width: "60px",
                    margin: "auto",
                  }}
                />
                <div style={{ height: "102px" }}>{item.description}</div>
              </div>
              <div className="mt-5">
                <ConsultationButton
                  path={"/discover-more"}
                  onClick={() =>
                    item.service && router.push(serviceDetailsPath(item))
                  }
                >
                  {item.btntext}
                </ConsultationButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverMoreComp;
