import Image from "next/image";
import React from "react";
import { color_schema } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useRouter } from "next/router";
import { CorporateHealthcareIcon, GeneralPhysician, HomeCareIcon, LabInvestigation, MedicineDelivery, NursingCareIcon } from "../../../public/svgIcon/all-department-svg-icon";

const DiscoverMoreComp = () => {
  const router = useRouter();
  const features = [
    {
      title: "Consultation",
        service: "Consultation",
      description:
        "Connect instantly with top-rated doctors for personalized medical consultations, expert health advice, and tailored treatment plans to improve your well-being.",
      icon: <GeneralPhysician color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: "View Details",
    },
    {
      title: "Nursing Services",
      service: "home care",
      description:
        "Receive professional healthcare and medical support at home, including nursing, therapy, and wellness services, ensuring comfort and convenience for you and your family.",
      icon: <HomeCareIcon color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: "View Details",
    },
    {
      title: "Lab Test",
      service: "lab-test",
      description:
        "Access advanced treatments and specialized medical care from experienced healthcare professionals, designed to meet your unique health needs and conditions.",
      icon: <LabInvestigation color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: "View Details",
    },
    // {
    //   title: "Medicine Delivery",
    //   service: "community",
    //   description:
    //     "Join community wellness programs and health initiatives that promote healthy living, disease prevention, and overall well-being for individuals and families.",
    //   icon: <MedicineDelivery color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
    //   btntext: "View Details",
    // },
    {
      title: "Community Care",
      service:"corporate",
      description:
        "Enhance employee well-being and productivity with comprehensive corporate healthcare solutions, including health screenings, wellness programs, and medical support for organizations.",
      icon: <CorporateHealthcareIcon color={`${color_schema.yellow}`} size={70} />, // Using the SVG icon component
      btntext: "View Details",
    },
  ];

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">
          <u>Discover More</u>
        </h1>
        <span className="section-id blue-color mt-5">
          <h5>
            Explore more services, features, and possibilities tailored just for
            you.
          </h5>
        </span>
        <div className="h5 box-list grey-color">
          HealthPath&apos;s comprehensive healthcare solutions: Online
          Consultation, Homecare, Specialized Clinic, Community Health, and
          Corporate Healthcare. Your path to well-being.
        </div>
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
                    router.push(
                      `/service-details/?Service=${item.title
                        .trim()
                        // .split(" ")
                        // .slice(1)
                      }`
                    )
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
