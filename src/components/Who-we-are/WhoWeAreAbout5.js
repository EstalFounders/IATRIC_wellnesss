import Image from "next/image";
import React from "react";

const WhoWeAreAbout5 = () => {
  return (
    <section id="info-1" className="info-section division py-5">
      <div className="container">
        <div className="row align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-12 col-lg-6 mb-4 mb-lg-0">
            <div className="text-center wow fadeInUp" data-wow-delay="0.6s">
              <Image
                src="/images/image-01.png"
                alt="about-image"
                width={800}
                height={500}
                style={{ width: "100%", height: "auto", maxWidth: "800px" }}
                className="img-fluid rounded"
                priority
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-12 col-lg-6">
            <div className="txt-block px-3 px-md-4 wow fadeInUp" data-wow-delay="0.4s">
              <span className="section-id blue-color">
                <h4>Best Practices</h4>
              </span>
              <h3 className="h3-md steelblue-color text-dark mt-3">
                Your Complete Healthcare Solution Under One Roof
              </h3>
              <div className="h5 box-list grey-color mt-3">
                Health Path is more than just consultations. We offer a one-stop
                solution for all your healthcare requirements, streamlining the
                process and saving you valuable time. Our services include:
              </div>
              <ul
                className="h6 box-list grey-color mt-3"
                style={{ listStyleType: "disc", paddingLeft: "20px" }}
              >
                <li>
                  <b>Lab Test:</b> Get all your necessary diagnostic <b>lab tests</b> conveniently arranged.
                </li>
                <li>
                  <b>Nursing Care:</b> Access professional and compassionate <b>nursing care</b> tailored to your needs.
                </li>
                <li>
                  <b>Elderly Care:</b> Dedicated and specialized <b>elderly care</b> services to support your senior family members.
                </li>
                <li>
                  <b>Corporate Health:</b> Comprehensive <b>corporate health</b> programs designed to keep your workforce healthy and productive.
                </li>
                <li>
                  <b>Student Health Camps:</b> Organized <b>student health camps</b> to promote well-being in educational institutions.
                </li>
              </ul>
              <div className="h6 box-list grey-color mt-3">
                Our team of <b>highly qualified doctors</b> and healthcare experts work in synergy to provide seamless, integrated care across all these services. With Health Path, your family&apos;s health is in expert hands, always within reach, and always a priority.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreAbout5;
