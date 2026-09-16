import { fontWeight } from "@mui/system";
import Image from "next/image";
import React from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ConsultationButton } from "../Common/commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";

const AboutUsInfo4 = () => {
  const { t } = useLanguage();
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
                  <h4>{t("demo5.about.welcome")}</h4>
                </span>
                {/* Title */}

                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  {t("about4.title1")}
                </h3>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p1"))}
                </p>
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p2"))}
                </p>
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p3"))}
                </p>
              </div>
              <div className="mt-2 d-flex justify-content-center mt-5 mb-4">
                <div className="w-25">
                  <ConsultationButton path={"/appointment"}>
                    {t("about5.cta")}
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
                  <h4>{t("about4.tag2")}</h4>
                </span>

                {/* Title */}
                <h3 className="h3-md steelblue-color">
                  {t("about4.title2")}
                </h3>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p4"))}
                </p>
                {/* Options List */}
                <div className="row h5 box-list grey-color mt-4">
                  <div className="col-md-6">
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>{t("about4.secA")}</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.a1"))}
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.a2"))}
                          </p>
                        </li>
                      </ul>
                    </p>
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />
                      <b>{t("about4.secB")}</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.b1"))}
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.b2"))}
                          </p>
                        </li>
                      </ul>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="h6" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>{t("about4.secC")}</b>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.c1"))}
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.c2"))}
                          </p>
                        </li>
                      </ul>
                    </p>
                    <p className="h6 h-50" style={{ color: "#3b5f1d" }}>
                      <FaAngleDoubleRight />{" "}
                      <b>{t("about4.secD")}</b>{" "}
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3"
                      >
                        <li>
                          <p className="p-sm" style={{ height: "150px" }}>
                            {richText(t("about4.c1"))}
                          </p>
                        </li>
                        <li>
                          <p className="p-sm" style={{ height: "180px" }}>
                            {richText(t("about4.c2"))}
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
