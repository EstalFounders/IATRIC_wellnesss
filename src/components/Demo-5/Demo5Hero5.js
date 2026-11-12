import Link from "next/link";
import React, { useEffect, useState } from "react";
import { color_schema } from "../../constant";
import { ConsultationButton } from "../Common/commonUi";
import { useRouter } from "next/router";
import { fetchBasicConfiguration } from "../ApiService/UtilService";
import { useDispatch } from "react-redux";
import { useLanguage } from "../../i18n/LanguageContext";

// Terms that rotate into the headline, one every 2.5s (30s loop). Only the
// leading phrase changes ("Medical treatment" -> "Doctor consultation" -> ...);
// the trailing "for you and your loved ones" is static, so the sentence itself never
// re-animates.
// "Doctor consultation" is the flagship service, so it lands after every two
// other terms instead of cycling once every nine seconds - the headline keeps
// coming back to the main call to action.
const HERO_TERM_KEYS = [
  "demo5.hero.term.medicalTreatment",
  "demo5.hero.term.patientCare",
  "demo5.hero.term.doctorConsultation",
  "demo5.hero.term.nursingCare",
  "demo5.hero.term.physiotherapy",
  "demo5.hero.term.doctorConsultation",
  "demo5.hero.term.dietNutrition",
  "demo5.hero.term.homeCare",
  "demo5.hero.term.doctorConsultation",
  "demo5.hero.term.elderlyCare",
  "demo5.hero.term.vaccination",
  "demo5.hero.term.doctorConsultation",
];

// How long each term stays on screen. 2.5s is the sweet spot: long enough to read
// "Doctor consultation" without rushing, short enough that the headline still
// feels alive (12 slots => a 30s loop).
const HERO_TERM_INTERVAL = 2500;

const Demo5Hero5 = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [termIndex, setTermIndex] = useState(0);

  useEffect(() => {
    fetchBasicConfiguration(dispatch);
  }, []);

  // Advance the headline term every HERO_TERM_INTERVAL (2.5s). Starts after mount
  // (no server/client markup mismatch) and does nothing for
  // `prefers-reduced-motion` users, who keep the first term. The interval is
  // cleared on unmount.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTermIndex((index) => (index + 1) % HERO_TERM_KEYS.length);
    }, HERO_TERM_INTERVAL);

    return () => window.clearInterval(intervalId);
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
            {/* Green banner + frosted-white content card (see `hero-glass-*` in
                customStyle.css). The banner fill is no longer an inline style:
                it needs color-mix()/backdrop-filter from CSS to stay a sharp
                92% green, while the card below it is translucent so the hero
                photo reads through without touching text contrast. */}
            <div className="hero-5-strip hero-glass-strip white-color">
              <div className="h2 m-0 font-weight-bold">{t("demo5.hero.provides")}</div>
            </div>
            <div className="hero-txt hero-glass-card">
              {/* Title */}
              <h4
                className="steelblue-color"
                style={{ color: `${color_schema.yellow}` }}
              >
                <div style={{ fontSize: "1.8rem", fontWeight: "600" }}>{t("demo5.hero.bestQuality")}</div>
              </h4>
              {/* Headline: a rotating service term + a static "for you and your
                  family". Only the term lives inside `.hero-rotating-words`
                  (customStyle.css), which stacks every term in one inline-grid cell:
                  the cell is as wide/tall as the longest term, so the suffix and
                  everything below never shift, and only the term fades in - the
                  sentence as a whole stays put. The h3 carries the full original
                  sentence as `aria-label` (spans are aria-hidden) so screen readers
                  hear a stable sentence instead of a word changing every 2.5s. */}
              <h3
                className="steelblue-color hero-rotating-heading"
                style={{ color: "#3b5f1d" }}
                aria-label={t("demo5.hero.title")}
              >
                <span className="hero-rotating-words" aria-hidden="true">
                  {HERO_TERM_KEYS.map((termKey, index) => (
                    <span
                      key={`${termKey}-${index}`}
                      className={`hero-rotating-term${
                        index === termIndex ? " is-active" : ""
                      }`}
                    >
                      {t(termKey)}
                    </span>
                  ))}
                </span>{" "}
                <span aria-hidden="true">{t("demo5.hero.titleSuffix")}</span>
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
