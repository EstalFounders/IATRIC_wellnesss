import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ConsultationButton } from "../Common/commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";
import { color_schema, imageBlurDataUrl } from "../../constant";

// "What you get" answers, two per column. One line each keeps the section short;
// the full service list (with its own links) is rendered by <Services7 /> on the
// same page, so this block does not repeat it.
const WHAT_YOU_GET = [
  ["about4.w1", "about4.w2"],
  ["about4.w3", "about4.w4"],
];

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
                  placeholder="blur"
                  blurDataURL={imageBlurDataUrl}
                  src="/images/chief_doctor_700x800.jpg"
                  width={600}
                  height={500}
                  alt="HealthPath doctor consulting a patient at the clinic"
                />
              </div>
            </div>
            {/* INFO TEXT */}
            <div className="col-lg-6">
              <div className="txt-block pc-30" data-wow-delay="0.4s">
                {/* Section ID - an eyebrow, not a heading, so the H1 below is the
                    first heading on the page (the page banner renders none) */}
                <p className="h4 about-eyebrow">{t("demo5.about.welcome")}</p>
                {/* Title - the page H1 */}
                <h1 className="h3-md steelblue-color">{t("about4.title1")}</h1>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p1"))}
                </p>
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p2"))}
                </p>
              </div>
              <div className="mt-2 d-flex justify-content-center mt-5 mb-4 px-3">
                <div
                  className="w-100"
                  style={{ maxWidth: "280px", minWidth: 0 }}
                >
                  <ConsultationButton path={"/appointment"}>
                    <span
                      style={{
                        display: "block",
                        width: "100%",
                        color: "#fff",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        textAlign: "center",
                      }}
                    >
                      {t("about5.cta")}
                    </span>
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
                <p className="h4 about-eyebrow">{t("about4.tag2")}</p>
                {/* Title */}
                <h2 className="h3-md steelblue-color">{t("about4.title2")}</h2>
                {/* Text */}
                <p className="h5 box-list grey-color">
                  {richText(t("about4.p4"))}
                </p>
                {/* Options List */}
                <div className="row h5 box-list grey-color mt-4">
                  <div className="col-md-12">
                    <h3 className="h6" style={{ color: color_schema.green }}>
                      <FaAngleDoubleRight /> <b>{t("about4.secA")}</b>
                    </h3>
                  </div>
                  {WHAT_YOU_GET.map((column, index) => (
                    <div className="col-md-6" key={`what-${index}`}>
                      <ul
                        style={{ listStyleType: "disc", paddingLeft: "20px" }}
                        className="mt-3 mb-0"
                      >
                        {column.map((key) => (
                          <li className="p-sm mb-3" key={key}>
                            {richText(t(key))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {/* End Options List */}
                {/* Real anchors, so the copy links into the listings it mentions */}
                <div className="about-links">
                  <Link legacyBehavior href="/all-services">
                    <a>{t("about4.linkServices")}</a>
                  </Link>
                  <Link legacyBehavior href="/all-doctors">
                    <a>{t("about4.linkDoctors")}</a>
                  </Link>
                </div>
              </div>
            </div>
            {/* END INFO TEXT */}
            {/* INFO IMAGE */}
            <div className="col-lg-6">
              <div className="info-4-img text-center" data-wow-delay="0.6s">
                <Image
                  placeholder="blur"
                  blurDataURL={imageBlurDataUrl}
                  src="/images/emergency_help_700x800.jpg"
                  width={700}
                  height={800}
                  alt="HealthPath doctor making a home visit"
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
