import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import Link from "next/link";
import React from "react";
import { ConsultationButton } from "../Common/commonUi";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo5About6 = () => {
  const { t } = useLanguage();
  return (
    <section id="about-6" className="about-section division mt-5">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div className="txt-block pc-30">
              {/* Section ID */}
              <span className="section-id blue-color">
                <h4>{t("about6.tag")}</h4>
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                {t("about6.title")}
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="h5 box-list grey-color">
                {t("about6.text")}
              </div>
              {/* Button */}
              <div className="w-50 mr-auto mt-5">
                <ConsultationButton path={"/all-doctors"}>
                  {t("about6.cta")}
                </ConsultationButton>
              </div>
            </div>
          </div>
          {/* END TEXT BLOCK */}
          {/* IMAGE BLOCK */}
          <div className="col-lg-6">
            <div
              className="about-img text-center"
            >
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
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
