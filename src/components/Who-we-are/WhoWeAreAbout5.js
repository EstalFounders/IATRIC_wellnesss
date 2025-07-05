import Image from "next/image";
import React from "react";

const WhoWeAreAbout5 = () => {
  return (
    <section id="about-5" className="pt-100 about-section division">
      <div className="container h5 box-list grey-color">
        <div className="row d-flex align-items-center">
      <div className="container">
        <div className="row d-flex align-items-center mb-4">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div
              className="about-img text-center wow fadeInUp"
              data-wow-delay="0.6s"
            >
              <Image
                className="img-fluid"
                src="/images/image-01.png"
                alt="about-image"
                width={500}
                height={700}
                />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div className="txt-block pc-30 wow fadeInUp" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>Best Practices</h4>
              </span>

              {/* Title */}
              <h3 className="h3-md steelblue-color">
                Your Complete Healthcare Solution Under One Roof
              </h3>
              {/* Text */}
              <p className="h5 box-list grey-color">
                Health Path is more than just consultations. We offer a one-stop
                solution for all your healthcare requirements, streamlining the
                process and saving you valuable time. Our services include:
              </p>
              <ul
                className="h6 box-list grey-color"
                style={{ listStyleType: "disc", paddingLeft: "20px" }}
              >
                <li>
                  <b>Lab Test:</b>
                  Get all your necessary diagnostic <b>lab tests</b>{" "}
                  conveniently arranged.
                </li>
                <li>
                  <b>Nursing Care:</b>
                  Access professional and compassionate <b>nursing care</b>{" "}
                  tailored to your needs.
                </li>
                <li>
                  <b>Elderly Care:</b>
                  Dedicated and specialized <b>elderly care</b> services to
                  support your senior family members.
                </li>
                <li>
                  <b>Corporate Health:</b>
                  Comprehensive <b>corporate health</b> programs designed to
                  keep your workforce healthy and productive.
                </li>
                <li>
                  <b>Student Health Camps:</b>
                  Organized <b>student health camps</b> to promote well-being in
                  educational institutions.
                </li>
              </ul>
              <p className="h6 box-list grey-color mt-2">
                Our team of <b>highly qualified doctors</b> and healthcare
                experts work in synergy to provide seamless, integrated care
                across all these services. With Health Path, your family&apos;s
                health is in expert hands, always within reach, and always a
                priority.
              </p>
            </div>
          </div>
          {/* END TEXT BLOCK */}
        </div>
        {/* End row */}
      </div>
      </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default WhoWeAreAbout5;
