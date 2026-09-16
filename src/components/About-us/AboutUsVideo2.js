import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";

const WhoWeAreInfo1 = () => {
  const { t } = useLanguage();
  return (
    <section id="info-1" className="wide-60 info-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div
              className="info-1-img text-center mb-40 wow fadeInUp"
              data-wow-delay="0.6s"
            >
              <img
                className="img-fluid"
                src="images/image-11.png"
                alt="info-image"
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div
              className="txt-block pc-30 mb-40 wow fadeInUp"
              data-wow-delay="0.4s"
            >
              {/* Section ID */}
              <span className="section-id blue-color">
                <h5>{t("about.video.welcome")}</h5>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                {t("about.video.title")}
              </h3>
              {/* Text */}
              <p className="h5 box-list grey-color">{richText(t("about.video.p1"))}</p>
              <h4 className="h3-md steelblue-color">
                {t("about.video.h2")}
              </h4>
              <p className="h5 box-list grey-color">{richText(t("about.video.p2"))}</p>
              {/* End Options List */}
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

export default WhoWeAreInfo1;