import React from "react";

const About5 = () => {
  return (
    <section id="about-5" className="pt-100 about-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div className="about-img text-center" data-wow-delay="0.6s">
              <img
                className="img-fluid"
                src="images/image-03.png"
                alt="about-image"
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div className="txt-block pc-30" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h5>Welcome to Healthpath</h5>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Keep Doctors & Loved One in the Loop
              </h3>
              {/* Text */}
              <p>
                Securely share your comprehensive medical history with doctor
                with loved ones, for better communication and care{" "}
              </p>
              {/* Singnature */}
              <div className="singnature mt-35">
                {/* Text */}
                {/* <p className="p-small mb-15">Randon Pexon, Head of Clinic</p> */}
                {/* Singnature Image */}
                {/* Recommended sizes for Retina Ready displays is 400x68px; */}
                {/* <img
                  className="img-fluid"
                  src="images/signature.png"
                  width={200}
                  height={34}
                  alt="signature-image"
                /> */}
              </div>
            </div>
          </div>
          {/* END TEXT BLOCK */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default About5;
