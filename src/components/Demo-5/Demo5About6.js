import Image from "next/image";
import Link from "next/link";
import React from "react";

const Demo5About6 = () => {
  return (
    <section id="about-6" className="about-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div className="txt-block pc-30">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>Best Practices</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Clinic with Innovative Approach to Treatment
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="h5 box-list grey-color">
                Skip the long wait times and crowded waiting rooms. Access
                professional healthcare consultations from the comfort of your
                home, office, or anywhere with an internet connection. Our
                flexible scheduling options allow you to fit healthcare into
                your busy life, at your own pace.
              </div>
              {/* Button */}
              <Link legacyBehavior href="/all-doctors">
                <a
                  className="btn btn-blue blue-hover mt-25"
                  style={{ backgroundColor: "#3b5f1d" }}
                >
                  Meet The Doctors
                </a>
              </Link>
            </div>
          </div>
          {/* END TEXT BLOCK */}
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div className="about-img text-center wow fadeInUp" data-wow-delay="0.6s">
              <Image  
                width={500}
                height={550}
                className="img-fluid"
                src="/images/image-02.png"
                alt="about-image"
              />
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5About6;
