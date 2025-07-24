import { fontWeight } from "@mui/system";
import Image from "next/image";
import React from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ConsultationButton } from "../Common/commonUi";

const AboutUsInfo4 = () => {
  return (
    <section id="info-4" className="wide-100 info-section division">
      <div className="h5 box-list grey-color">
        {/* TOP ROW */}
        <div className="top-row mb-80">
          <div className="row d-flex align-items-center">
            {/* INFO IMAGE */}
            <div className="col-lg-6">
              <div className="info-4-img text-center" data-wow-delay="0.6s">
                <Image
                  src="/images/chief_doctor_700x800.jpg"
                  width={600}
                  height={500}
                  alt="info-image"
                />
              </div>
            </div>
            {/* INFO TEXT */}
            <div className="col-lg-6">
              <div className="txt-block pc-30" data-wow-delay="0.4s">
                {/* Section ID */}
                <span className="section-id blue-color">
                  <h4>Welcome to Healthpath</h4>
                </span>
                {/* Title */}

                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  Healthpath: Your Convenient Path to Innovative Healthcare
                </h3>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  At Healthpath, we&apos;re revolutionizing healthcare by
                  putting
                  <b> your convenience and well-being first.</b> We know that
                  managing busy schedules and dealing with long wait times can
                  make accessing quality medical care a challenge. That&apos;s
                  why we&apos;ve pioneered a unique approach, bringing{" "}
                  <b>expert medical care directly to you.</b>
                </p>
                <p className="h5 box-list grey-color">
                  Our innovative treatment model is designed to seamlessly
                  integrate into your life, offering{" "}
                  <b>personalized, high-quality healthcare</b> without the
                  traditional hurdles. Whether you need a consultation,
                  follow-up, or specialized treatment, Healthpath provides a
                  flexible and efficient solution that prioritizes your health
                  and time.
                </p>
                <p className="h5 box-list grey-color">
                  Experience the future of healthcare with Healthpath – where{" "}
                  <b>
                    cutting-edge medical expertise meets unparalleled patient
                    convenience.
                  </b>
                </p>
              </div>
              <div className="mt-2 d-flex justify-content-center mt-5 mb-4">
                <div className="w-25">
                  <ConsultationButton path={"/appointment"}>
                    Book Consultation
                  </ConsultationButton>
                </div>
              </div>
            </div>
            {/* END TEXT BLOCK */}
          </div>
          {/* End row */}
        </div>
        {/* END TOP ROW */}
        {/* BOTTOM ROW */}
        <div className="bottom-row h5 box-list grey-color">
          <div className="row d-flex align-items-center">
            {/* INFO TEXT */}
            <div className="col-lg-6">
              <div className="txt-block pc-30" data-wow-delay="0.4s">
                {/* Section ID */}
                <span className="section-id blue-color">
                  <h4>Highest Quality Care</h4>
                </span>

                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  Healthpath: Comprehensive Medical Care, Delivered to Your
                  Doorstep
                </h3>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  At Healthpath, we bring{" "}
                  <b>all your medical needs under one roof</b>, ensuring you
                  receive expert attention without ever leaving the comfort of
                  your home. We understand the value of your time and peace of
                  mind, which is why we offer a comprehensive suite of
                  convenient healthcare services designed around you.
                </p>
                {/* Options List */}
                <div className="row h5 box-list grey-color mt-4">
                  <div className="col-md-6">
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>Seamless Access to Expert Care: Online & Offline</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              Online Doctor Consultations:
                            </b>{" "}
                            Connect effortlessly with highly qualified and
                            experienced doctors across a wide range of
                            specialties. From{" "}
                            <b>
                              general physicians and pediatricians to
                              orthopedists, cardiologists, dentists, and
                              dermatologists
                            </b>
                            , our online platform provides secure and convenient
                            access to medical advice and personalized care from
                            anywhere in India.
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              In-Clinic Appointments:
                            </b>{" "}
                            For those who prefer a traditional setting, you can
                            easily schedule appointments at our modern clinic ,
                            where our compassionate healthcare providers are
                            ready to offer in-person consultations and
                            examinations
                          </p>
                        </li>
                      </ul>
                    </p>
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />
                      <b> Personalized Home Healthcare Services:</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              Doctor Home Visits:
                            </b>{" "}
                            When you need medical care in the comfort of your
                            own residence, our dedicated doctors provide
                            <b>convenient home visits</b> , ensuring you receive
                            the treatment you need without the hassle of travel.
                            This service is ideal for elderly patients, those
                            with mobility challenges, or anyone seeking a more
                            private consultation.
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              At-Home Nursing Care:
                            </b>{" "}
                            For critically ill patients or those recovering at
                            home, Healthpath offers{" "}
                            <b>professional and compassionate nursing care.</b>{" "}
                            Our skilled nurses provide essential support,
                            monitoring, and treatment, ensuring continuous,
                            high-quality care in a familiar environment.
                          </p>
                        </li>
                      </ul>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>Beyond Consultations: Complete Healthcare:</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              At-Home Lab Tests & Blood Work:
                            </b>{" "}
                            Get your essential{" "}
                            <b>lab tests and blood work-ups</b>
                            done from the convenience of your home. Our trained
                            professionals ensure a smooth and comfortable
                            experience.
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              Medication & Medical Equipment Delivery::
                            </b>{" "}
                            Receive{" "}
                            <b>
                              essential medications and medical equipment
                              delivered directly to your doorstep
                            </b>{" "}
                            , saving you time and ensuring you have everything
                            you need for your recovery or ongoing health
                            management.{" "}
                          </p>
                        </li>
                      </ul>
                    </p>
                    <p className="h6 h-50" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>For More Services and Additional Support:</b>{" "}
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              At-Home Lab Tests & Blood Work:
                            </b>{" "}
                            Get your essential{" "}
                            <b>lab tests and blood work-ups</b>
                            done from the convenience of your home. Our trained
                            professionals ensure a smooth and comfortable
                            experience.
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "180px" }}>
                            <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                              Medication & Medical Equipment Delivery::
                            </b>{" "}
                            Receive{" "}
                            <b>
                              essential medications and medical equipment
                              delivered directly to your doorstep
                            </b>{" "}
                            , saving you time and ensuring you have everything
                            you need for your recovery or ongoing health
                            management.{" "}
                          </p>
                        </li>
                      </ul>
                    </p>
                  </div>
                </div>
                {/* End Options List */}
              </div>
            </div>
            {/* END INFO TEXT */}
            {/* INFO IMAGE */}
            <div className="col-lg-6">
              <div className="info-4-img text-center" data-wow-delay="0.6s">
                <Image
                  src="/images/emergency_help_700x800.jpg"
                  width={700}
                  height={800}
                  alt="info-image"
                />
              </div>
            </div>
          </div>
          {/* End row */}
        </div>
        {/* END BOTTOM ROW */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AboutUsInfo4;
