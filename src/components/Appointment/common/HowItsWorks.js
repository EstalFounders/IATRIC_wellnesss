import React from "react";
import {
  TouchApp,
  ChatBubbleOutline,
  LocalPharmacy,
} from "@mui/icons-material";

const steps = [
  {
    icon: <TouchApp fontSize="large" />,
    label: "Select a speciality or symptom",
  },
  {
    icon: <ChatBubbleOutline fontSize="large" />,
    label: "Audio/ video call with a verified doctor",
  },
  {
    icon: <LocalPharmacy fontSize="large" />,
    label: "Get a digital prescription & a free follow-up",
  },
];

const HowItWorks = () => {
  return (
    <div className="container my-5">
      <div className="position-relative">
        {/* Centered Heading */}
        <h3
          className="text-center mb-4 tex-dark h3-md"
          style={{
            position: "absolute",
            top: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 600,
          }}
        >
          How It Works
        </h3>

        <div className="row flex-column flex-md-row justify-content-between align-items-center position-relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Vertical connector on mobile between steps */}
              {index > 0 && (
                <div
                  className="d-md-none"
                  style={{
                    width: "2px",
                    height: "30px",
                    backgroundColor: "#3b5f1d",
                    margin: "0 auto",
                    zIndex: 2,
                  }}
                ></div>
              )}
              <div
                className="text-center flex-fill mt-5"
                style={{ zIndex: 2 }}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-2"
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#e6f4ea",
                    color: "#3b5f1d",
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontWeight: 500 }}>{step.label}</div>
              </div>
            </React.Fragment>
          ))}

          {/* Horizontal connecting line - desktop only */}
          <div
            className="d-none d-md-block position-absolute top-50 start-0 w-100"
            style={{
              borderTop: "2px solid #3b5f1d",
              zIndex: 1,
              transform: "translateY(-50%)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;