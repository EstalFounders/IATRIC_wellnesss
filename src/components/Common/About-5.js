import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import React from "react";
import { ConsultationButton } from "./commonUi";
import { useLanguage } from "../../i18n/LanguageContext";

const About5 = () => {
  const { t } = useLanguage();
  return (
    <section id="about-5" className="pt-100 about-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div className="about-img text-center">
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
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
            <div className="pc-30">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>{t("demo5.about.welcome")}</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md">
                {t("about5.title")}
              </h3>
              {/* Text */}
              <div className="h5 box-list grey-color">
                {t("about5.text")}
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
              <div className="mt-5 mr-auto">
                <div className="w-50">
                  <ConsultationButton path={"/appointment"}>
                    {t("about5.cta")}
                  </ConsultationButton>
                </div>
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
