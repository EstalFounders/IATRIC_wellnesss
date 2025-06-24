import { fontWeight } from "@mui/system";
import React from "react";
import { FaAngleDoubleRight } from "react-icons/fa";

const AboutUsInfo4 = () => {
  return (
    <section id="info-4" className="wide-100 info-section division">
      <div className="container">
        {/* TOP ROW */}
        <div className="top-row mb-80">
          <div className="row d-flex align-items-center">
            {/* INFO IMAGE */}
            <div className="col-lg-6">
              <div className="info-4-img text-center" data-wow-delay="0.6s">
                <img
                  className="img-fluid"
                  src="images/chief_doctor_700x800.jpg"
                  alt="info-image"
                />
              </div>
            </div>
            {/* INFO TEXT */}
            <div className="col-lg-6">
              <div className="txt-block pc-30" data-wow-delay="0.4s">
                {/* Section ID */}
                <span className="section-id blue-color">
                  Welcome to Healthpath
                </span>
                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  Clinic with Innovative Approach to Treatment
                </h3>
                {/* Text */}
                <p>
                  Healthpath offers a revolutionary approach to medical care,
                  placing your convenience and well-being at the forefront. We
                  understand the challenges of busy schedules and long wait
                  times, which is why we&apos;ve designed a system that delivers
                  expert medical care directly to you.
                </p>
              </div>
            </div>
            {/* END TEXT BLOCK */}
          </div>
          {/* End row */}
        </div>
        {/* END TOP ROW */}
        {/* BOTTOM ROW */}
        <div className="bottom-row">
          <div className="row d-flex align-items-center">
            {/* INFO TEXT */}
            <div className="col-lg-6">
              <div className="txt-block pc-30" data-wow-delay="0.4s">
                {/* Section ID */}
                <span className="section-id blue-color">
                  Highest Quality Care
                </span>
                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  All Your Medical Needs, Under One Roof
                </h3>
                {/* Text */}
                <p className="mb-30">
                  Imagine getting expert medical attention, from online
                  consultations to personalized home visits, all without leaving
                  your comfort zone. Healthpath provides a comprehensive suite
                  of services, including:
                </p>
                {/* Options List */}
                <div className="row">
                  <div className="col-xl-6">
                    {/* Option #1 */}
                    <div className="box-list">
                      <div className="box-list-icon blue-color">
                        <FaAngleDoubleRight />
                      </div>
                      <p className="p-sm">
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          Online Consultations:
                        </b>{" "}
                        Connect with qualified doctors across various
                        specialties – physicians, pediatricians, orthopedists,
                        cardiologists, dentists, dermatologists, and more – all
                        from the comfort of your home by online consultations
                        and home visits.
                      </p>
                    </div>
                    {/* Option #2 */}
                    <div className="box-list">
                      <div className="box-list-icon blue-color">
                        <FaAngleDoubleRight />
                      </div>
                      <p className="p-sm">
                        {" "}
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          Offline Consultations:
                        </b>{" "}
                        Schedule in-clinic appointments with our experienced
                        healthcare providers for a more traditional setting.
                      </p>
                    </div>
                  </div>
                  <div className="col-xl-6">
                    {/* Option #3 */}
                    <div className="box-list">
                      <div className="box-list-icon blue-color">
                        <FaAngleDoubleRight />
                      </div>
                      <p className="p-sm">
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          Home Visits:
                        </b>{" "}
                        For patients who require care in the comfort of their
                        own homes, we offer convenient doctor visits and nursing
                        care ensuring you receive the treatment you need without
                        the hassle of travel.
                      </p>
                    </div>
                    {/* Option #4 */}
                    <div className="box-list" style={{ marginTop: "30px" }}>
                      <div className="box-list-icon blue-color">
                        <FaAngleDoubleRight />
                      </div>
                      <p className="p-sm">
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          Additional Support:
                        </b>{" "}
                        We go beyond doctor consultations. We provide lab test ,
                        blood work up along with dedicated nursing care for
                        critically ill patients at home, delivery of essential
                        medications and medical equipment directly to your
                        doorstep.
                      </p>
                    </div>
                  </div>
                </div>
                {/* End Options List */}
              </div>
            </div>
            {/* END INFO TEXT */}
            {/* INFO IMAGE */}
            <div className="col-lg-6">
              <div className="info-4-img text-center" data-wow-delay="0.6s">
                <img
                  className="img-fluid"
                  src="images/emergency_help_700x800.jpg"
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
