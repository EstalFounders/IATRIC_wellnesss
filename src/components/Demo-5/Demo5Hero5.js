import Link from "next/link";
import React, { useEffect } from "react";
import { color_schema } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useRouter } from "next/router";
import { fetchBasicConfiguration } from "../ApiService/UtilService";
import { useDispatch } from "react-redux";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo5Hero5 = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchBasicConfiguration(dispatch);
  }, []);

  // Same entry point as the header "Book Now": the consultation flow with the
  // service preselected, so the user lands straight on the booking form.
  const handleBookNowClick = () => {
    router.push(`/appointment?service=${encodeURIComponent("Book_Consultation")}`);
  };

  return (
    <section id="hero-5" className="bg-fixed hero-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* HERO TEXT */}
          <div className="col-md-9 col-lg-7 col-xl-6">
            <div
              className="hero-5-strip bg-blue white-color"
              style={{ backgroundColor: `${color_schema.green}` }}
            >
              <div className="h2 m-0 font-weight-bold">{t("demo5.hero.provides")}</div>
            </div>
            <div className="hero-txt">
              {/* Title */}
              <h4
                className="steelblue-color"
                style={{ color: `${color_schema.yellow}` }}
              >
                <div style={{ fontSize: "1.8rem", fontWeight: "600" }}>{t("demo5.hero.bestQuality")}</div>
              </h4>
              <h3 className="steelblue-color" style={{ color: "#3b5f1d" }}>
                {t("demo5.hero.title")}
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list grey-color">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <div
                  className="h5 mx-auto steelblue-color"
                  style={{ color: "#010101" }}
                >
                  {t("demo5.hero.optimal")} ,{" "}
                  <strong style={{ color: "#010101" }}>
                    {t("demo5.hero.anytime")}
                  </strong>{" "}
                  <br />
                  <br />
                  <b style={{ color: "#010101" }}>{t("demo5.hero.onestopLabel")}</b>{" "}{t("demo5.hero.onestop")}


                </div>
              </div>
              {/* CONTENT BOX #3 */}
              <div className="box-list grey-color mb-15">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <p>
                  {/* Your health is important to us. Whether you have questions,
                  concerns, or need to schedule an appointment, Iatric
                  healthcare is here to help! We're committed to your
                  satisfaction and look forward to partnering with you on your
                  healthcare journey. */}
                </p>
              </div>
              {/* CTA pair - primary "Book Now" (solid, attention pulse) next to
                  the secondary "Discover More" (ghost/outline). `.hero-cta`
                  (customStyle.css) is a wrapping flex row with a 12px gap: the two
                  buttons sit side by side on desktop and stack full-width on
                  phones. It used to be a single button in a fixed 50%/320px
                  wrapper, which clipped the label on small screens. */}
              <div className="hero-cta">
                <ConsultationButton
                  variant="book-now"
                  onClick={handleBookNowClick}
                >
                  {t("common.bookNow")}
                </ConsultationButton>
                <ConsultationButton variant="outline" path={"/discover-more"}>
                  {t("common.discoverMore")}
                </ConsultationButton>
              </div>
            </div>
          </div>
          {/* END HERO TEXT */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Hero5;
