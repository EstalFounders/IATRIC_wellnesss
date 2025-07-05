import Link from "next/link";
import React, { useState } from "react";
import Popup from "../Popup";
import { FaPlay } from "react-icons/fa";

const AboutUsVideo2 = () => {
  const [video, setVideo] = useState(false);
  return (
    <section id="video-2" className="wide-60 video-section division">
      {video && <Popup close={setVideo} />}
      <div className="container h5 box-list grey-color">
        <div className="row d-flex align-items-center">
          {/* VIDEO LINK */}
          <div className="col-lg-6">
            <div
              className="video-preview mb-40 text-center"
              data-wow-delay="0.6s"
            >
      {/* {video && <Popup close={setVideo} />} */}
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <div data-wow-delay="0.6s">
              <button
                className="video-btn ico-90"
                onClick={() => setVideo(true)}
              >
                <span className="ico-90">
                  <FaPlay />
                </span>
              </button>
              <video width="100%" height="900px" controls>
                <source src="/about_us_Vedio_540.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Change the link HERE!!! */}
            </div>
          </div>
          <div className="col-md-12 text-center">
          <div className="txt-block pc-30 mb-40" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>Community care</h4>
                <h5>Community care</h5>
              </span>
              {/* Title */}
              <h3 className="h3-md text-dark">Beyond Individual Care:</h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list m-top-15">
                {/* <div className="box-list-icon">
                  <i className="fas fa-genderless" />
                </div>
                <div>
                  Supporting Your Community Healthpath believes in promoting a
                  culture of wellness. We partner with companies to establish
                  and manage occupational health centers, keeping employees
                  healthy and productive. We also organize health camps at
                  workplaces and schools, making preventive healthcare
                  accessible to everyone.
                </div>
                </div> */}
                <p className="h5 box-list grey-color">
                  At Healthpath, we extend our commitment beyond individual care
                  to foster the health and well-being of the entire community.
                  We believe in promoting a proactive culture of wellness and
                  making preventive healthcare accessible to everyone.
                </p>
                <h3 className="h3-md steelblue-color">
                  Corporate & Occupational Health
                </h3>
                <p className="h5 box-list grey-color">
                  We partner with companies across India to establish and manage
                  <b>occupational health centers</b>, ensuring your employees
                  remain
                  <b>healthy, productive, and safe.</b> Our solutions help
                  businesses reduce absenteeism and improve morale.
                </p>
                <h3 className="h3-md steelblue-color">
                  Community Health Initiatives
                </h3>
                <p className="h5 box-list grey-color">
                  Healthpath brings healthcare closer to you through:
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                    <li>
                      <p className="p-sm">
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          Workplace Health Camps:
                        </b>{" "}
                        Offering <b>preventive screenings</b> and wellness
                        programs directly at workplaces , contributing to a
                        healthier workforce.
                      </p>
                    </li>
                    <li>
                      <p className="p-sm">
                        <b style={{ fontWeight: "bold", color: "#3b5f1d" }}>
                          School Health Programs:
                        </b>{" "}
                        Conducting <b>health camps and educational workshops</b>{" "}
                        in schools to promote hygiene and well-being among
                        students.
                      </p>
                    </li>
                  </ul>
                </p>
                <p className="h5 box-list grey-color">
                  By bringing these vital services to your doorstep, Healthpath
                  makes preventive healthcare convenient and achievable for more
                  individuals in our community. Join us in building a healthier
                  community.
                </p>
              </div>
            </div>
            </div>
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default AboutUsVideo2;
