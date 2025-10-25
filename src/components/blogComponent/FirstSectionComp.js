import { Padding } from "@mui/icons-material";
import React from "react";
import { MdSearch } from "react-icons/md";

const backgroundImage = "/images/blog/blog-bg.png";

const FirstSectionComp = ({}) => {
  const sectionStyle = {
    padding: "60px 0 70px 0",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    position: "relative",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // background: "rgba(0, 100, 140, 0.3)", // blue overlay
    zIndex: 1,
  };

  const contentStyle = {
    zIndex: 2,
    textAlign: "center",
    maxWidth: "700px",
  };

  return (
    <section style={sectionStyle}>
      <div style={overlayStyle}></div>
      <div className="container" style={contentStyle}>
        <h1 className="text-white fw-bold mb-3 display-4">
          Your Trusted Source for <br /> Medical Knowledge
        </h1>
        <p className="lead mb-4">
          Expert insights on health, wellness, and medical research. Stay
          informed with evidence-based articles from healthcare professionals.
        </p>

        <div className="input-group mb-3 shadow-sm">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search articles, conditions, treatments..."
            aria-label="Search"
            style={{ paddingRight: "3rem", borderRadius: "30px" }}
          />
          <span
            className=" ml-2 mt-2"
            style={{
              fontSize: "1.3rem",
              color: "#6c757d",
              pointerEvents: "none",
            }}
          >
            <MdSearch color="#ffffff" />
          </span>
        </div>

        <div className="row mt-4 justify-content-center w-75 mx-auto">
          <div className="col consultation-btn mb-2">
            Explore Categories
          </div>
          <div className="col consultation-btn mb-2 ml-1">
            Latest Articles
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstSectionComp;
