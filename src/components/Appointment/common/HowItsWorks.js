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

        <div className="row d-flex justify-content-between align-items-center position-relative ml-5">
          {steps.map((step, index) => (
            <div
              key={index}
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
          ))}

          {/* Dotted connecting line */}
          <div
            className="position-absolute top-50 start-0 w-100"
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
