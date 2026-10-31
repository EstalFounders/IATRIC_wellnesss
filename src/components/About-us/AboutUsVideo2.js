import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";

// One ordered list, so the 1-2-3 numbering comes from the markup instead of
// being typed into every translated string.
const STEPS = ["about.video.step1", "about.video.step2", "about.video.step3"];

const AboutUsVideo2 = () => {
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
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                className="img-fluid"
                src="/images/image-11.png"
                width={800}
                height={640}
                sizes="(max-width: 991px) 100vw, 50vw"
                alt="HealthPath doctor consulting a patient over a video call"
              />
            </div>
          </div>
          {/* TEXT BLOCK */}
          <div className="col-lg-6">
            <div
              className="txt-block pc-30 mb-40 wow fadeInUp"
              data-wow-delay="0.4s"
            >
              {/* Section ID - an eyebrow, not a heading */}
              <p className="h5 about-eyebrow">{t("about.video.welcome")}</p>
              {/* Title */}
              <h2 className="h3-md steelblue-color">
                {t("about.video.title")}
              </h2>
              {/* Text */}
              <ol
                className="h5 box-list grey-color"
                style={{ listStyleType: "decimal", paddingLeft: "22px" }}
              >
                {STEPS.map((key) => (
                  <li className="mb-3" key={key}>
                    {richText(t(key))}
                  </li>
                ))}
              </ol>
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

export default AboutUsVideo2;
