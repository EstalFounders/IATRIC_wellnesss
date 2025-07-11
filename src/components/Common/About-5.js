import Image from "next/image";
import React from "react";

const About5 = () => {
  return (
    <section id="about-5" className="pt-100 about-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div className="about-img text-center wow fadeInUp" data-wow-delay="0.2s">
              <Image
                width={500}
                height={700}
                className="img-fluid"
                src="/images/image-03.png"
                alt="about-image"
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div className="pc-30 wow fadeInUp" data-wow-delay="0.2s">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>Welcome to Healthpath</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md">
                Your Health is Our Priority at Healthpath
              </h3>
              {/* Text */}
                      <div className="h5 box-list grey-color">
                      At Healthpath, we&apos;re dedicated to your well-being. Whether you
                      have questions, concerns, or need to schedule an appointment,
                      our team is here to assist you every step of the way. We&apos;re
                      committed to your satisfaction and eagerly anticipate partnering
                      with you on your healthcare journey
                      </div>
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
