import React from "react";
import ReviewSlider from "./ReviewSlider";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo2Reviews2 = () => {
  const { t } = useLanguage();
  return (
    <section id="reviews-2" className="wide-100 reviews-section division">
      <div className="container h5 grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">{t("demo2.reviews.title")}</h3>
            {/* Text */}
            <div>
              <div className="h5 box-list grey-color">
                {t("demo2.reviews.intro1")}
                <br />
                <div className="mt-3">{t("demo2.reviews.intro2")}</div>
              </div>
            </div>
          </div>
          {/* END SECTION TITLE */}
          {/* TESTIMONIALS CONTENT */}

          {/* END TESTIMONIALS CONTENT */}
        </div>
        <ReviewSlider />
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo2Reviews2;
