import Link from "next/link";
import React, { useState } from "react";
import Popup from "../Popup";

const AboutUsVideo2 = () => {
  const [video, setVideo] = useState(false);
  return (
    <section id="video-2" className="wide-60 video-section division">
      {video && <Popup close={setVideo} />}
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* VIDEO LINK */}
          <div className="col-lg-6">
            <div
              className="video-preview mb-40 text-center"
              data-wow-delay="0.6s"
            >
              {/* Change the link HERE!!! */}
              <Link legacyBehavior href="#">
                <a
                  className="video-popup1"
                  href="#"
                  onClick={() => setVideo(true)}
                >
                  {/* Play Icon */}
                  <div className="video-btn play-icon-blue">
                    <div className="video-block-wrapper">
                      <i className="fas fa-play" />
                    </div>
                  </div>
                  {/* Preview */}
                  <img
                    className="img-fluid"
                    src="images/video-1.png"
                    alt="video-photo"
                  />
                </a>
              </Link>
            </div>
          </div>
          {/* END VIDEO LINK */}
          {/* VIDEO TEXT */}
          <div className="col-lg-6">
            <div className="txt-block pc-30 mb-40" data-wow-delay="0.4s">
              {/* Section ID */}
              <span className="section-id blue-color">Community care</span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">Beyond Individual Care:</h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list m-top-15">
                <div className="box-list-icon">
                  <i className="fas fa-genderless" />
                </div>
                <p>
                  Supporting Your Community Iatric Healthcare believes in
                  promoting a culture of wellness. We partner with companies to
                  establish and manage occupational health centers, keeping
                  employees healthy and productive. We also organize health
                  camps at workplaces and schools, making preventive healthcare
                  accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default AboutUsVideo2;
