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
              <h3 className="steelblue-color">
                {t("demo5.hero.title")}
              </h3>
              {/* CONTENT BOX #1 */}
              <div className="box-list grey-color">
                <div className="box-list-icon">
                  {/* <i className="fas fa-genderless" /> */}
                </div>
                <div className="h5 mx-auto steelblue-color">
                  {t("demo5.hero.optimal")} ,{" "}
                  <strong style={{ color: `${color_schema.green}` }}>
                    {t("demo5.hero.anytime")}
                  </strong>{" "}
                  <br />
                  <br />
                  <b style={{ color: "#3b5f1d" }}>{t("demo5.hero.onestopLabel")}</b>{" "}{t("demo5.hero.onestop")}


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
              {/* Button - full width on phones, capped so it stays a normal
                  button size on desktop (was a fixed 50% wrapper, which clipped
                  the label on small screens). */}
              <div className="hero-cta" style={{ width: "100%", maxWidth: "320px" }}>
                <ConsultationButton path={"/discover-more"}>
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
