import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ConsultationButton } from "../Common/commonUi";

const Demo5About6 = () => {
  return (
    <section id="about-6" className="about-section division mt-5">
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
              <div>
                <ConsultationButton path={"/all-doctors"}>
                  MEET THE DOCTORS
                </ConsultationButton>
              </div>
            </div>
          </div>
          {/* END TEXT BLOCK */}
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div
              className="about-img text-center wow fadeInUp"
              data-wow-delay="0.2s"
            >
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
