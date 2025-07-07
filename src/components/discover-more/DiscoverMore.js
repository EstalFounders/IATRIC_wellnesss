import Image from "next/image";
import React from "react";

const DiscoverMoreComp = () => {
const features = [
    {
        title: "Consultation",
        description: "Connect instantly with top-rated doctors for personalized medical consultations, expert health advice, and tailored treatment plans to improve your well-being.",
        icon: "/images/discover-more/consultationIcon.png",
    },
    {
        title: "Homecare Services",
        description: "Receive professional healthcare and medical support at home, including nursing, therapy, and wellness services, ensuring comfort and convenience for you and your family.",
        icon: "/images/discover-more/homecare.png",
    },
    {
        title: "Specialized Clinic",
        description: "Access advanced treatments and specialized medical care from experienced healthcare professionals, designed to meet your unique health needs and conditions.",
        icon: "/images/discover-more/specializedClinic.png",
    },
    {
        title: "Community Health",
        description: "Join community wellness programs and health initiatives that promote healthy living, disease prevention, and overall well-being for individuals and families.",
        icon: "/images/discover-more/communityhealth.png",
    },
    {
        title: "Corporate Healthcare",
        description: "Enhance employee well-being and productivity with comprehensive corporate healthcare solutions, including health screenings, wellness programs, and medical support for organizations.",
        icon: "/images/discover-more/corporatehealth.png",
    },
];

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Discover More</h1>
        <p className="lead text-muted">
          Explore more services, features, and possibilities tailored just for
          you.
        </p>
      </div>

        <div className="row g-4 justify-content-center">
          {features.map((item, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4 p-4">
            <div
              className="green-hover h-100 shadow-sm border-0 text-center p-4"
              style={{ borderRadius: '10px', minWidth: '320px' }}
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
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="img-fluid"
                />
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
                <p className="mt-3">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverMoreComp;
