import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "../../i18n/LanguageContext";
import { getServiceTitle } from "../../i18n/serviceNames";
import { demo5ServiceHighlights } from "../../../data/services";
import {
  mergeServiceLists,
  useGlobalData,
} from "../../customUtils/useGlobalData";
import {
  getServiceDescription,
  isComingSoonService,
  isLabService,
  LAB_SERVICE_KEY,
  LAB_SERVICE_NAME,
  serviceDetailsPath,
} from "../../customUtils/serviceLinks";
import {
  CardiologyIcon,
  CorporateHealthcareIcon,
  Dentistry,
  DermatologistIcon,
  GeneralPhysician,
  GynaecologyIcon,
  HealthCampIcon,
  HomeCareIcon,
  LabInvestigation,
  MedicineDelivery,
  NursingCareIcon,
  NutritionistIcon,
  OphthalmologyIcon,
  OrthopaedicsIcon,
  PediatricsIcon,
  PhysiotherapyIcon,
  Psychiatrist,
  PulmonologyIcon,
} from "../../../public/svgIcon/all-department-svg-icon";

// Name -> icon map: the DB decides which services exist, so every card needs an
// icon even when the static highlights list has no matching entry.
const ICON_BY_NAME = {
  // specialities
  "general physician": GeneralPhysician,
  pediatrics: PediatricsIcon,
  cardiology: CardiologyIcon,
  dermatologist: DermatologistIcon,
  dermatology: DermatologistIcon,
  orthopaedics: OrthopaedicsIcon,
  "gynaecology & obstetrics": GynaecologyIcon,
  gynecology: GynaecologyIcon,
  ophthalmology: OphthalmologyIcon,
  pulmonology: PulmonologyIcon,
  psychiatrist: Psychiatrist,
  psychiatry: Psychiatrist,
  dentistry: Dentistry,
  physiotherapy: PhysiotherapyIcon,
  nutritionist: NutritionistIcon,
  dietitian: NutritionistIcon,
  dietician: NutritionistIcon,
  nutrition: NutritionistIcon,
  "nutrition & dietetics": NutritionistIcon,
  dietetics: NutritionistIcon,
  diet: NutritionistIcon,
  // services (serviceOffered MAJOR items)
  labtest: LabInvestigation,
  "lab investigation": LabInvestigation,
  "nursing care": NursingCareIcon,
  "home care": HomeCareIcon,
  "medicine delivery": MedicineDelivery,
  "corporate healthcare": CorporateHealthcareIcon,
  healthcamp: HealthCampIcon,
  audio: GeneralPhysician,
  video: GeneralPhysician,
};

// Falls back to the doctor-consultation icon so no card is ever icon-less.
// `size` is overridable because the phone grid uses the same icon at 34px.
const renderServiceIcon = (name, size = 70) =>
  React.createElement(
    ICON_BY_NAME[String(name || "").toLowerCase()] || GeneralPhysician,
    { size }
  );

const Demo5Services1 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const { t, lang } = useLanguage();

  const marqueeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Single source of truth: globalData slice services list (falls back to the
  // static highlights when the API has not answered), assets merged by name.
  const { services } = useGlobalData();
  const highlights = useMemo(
    () => mergeServiceLists(services, demo5ServiceHighlights),
    [services]
  );
  const combinedFeatures = [...highlights, ...highlights];

  // One localized title per card, resolved in this order:
  //   1. data/serviceNames.json - home-page services, keyed by service id
  //      (`nameId`), one name per locale ({ en, hi }).
  //   2. service.<Name> - the shared speciality dictionary already used by
  //      Tabs-1 / Demo5Services2 (so the static fallback list stays translated).
  //   3. the DB / static name - last resort only.
  // The result is always exactly ONE string. The old `t(item.titleKey, item.title)`
  // call mixed an English `title` with a Hindi dictionary value whenever the DB
  // name and the dictionary disagreed, and had no entry at all for DB-only rows
  // (Medicine Delivery, Audio, Video, Healthcamp, Labtest), which stayed English.
  const serviceTitle = (item) => {
    const localized = getServiceTitle(
      item.nameId || item.name || item.title,
      lang
    );
    if (localized) return localized;

    const name = item.name || item.title || "";
    return t(`service.${name}`, name);
  };

  // ✅ Touch support
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    let startX, scrollLeft;

    const onTouchStart = (e) => {
      startX = e.touches[0].pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onTouchMove = (e) => {
      const x = e.touches[0].pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ✅ Mouse drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleClick = (item) => {
    // Clean URL: the service name is what the details page displays. The merged
    // lab service always links to its single canonical URL whatever alias the
    // DB/static list happens to carry ("Labtest", "Blood Test & Diagnostics").
    if (isLabService(item.name || item.title || item.service)) {
      router.push(serviceDetailsPath({ name: LAB_SERVICE_NAME, service: LAB_SERVICE_KEY }));
      return;
    }
    router.push(serviceDetailsPath(item));
  };

  return (
    <section className="services-section services-section--tile-grid pb-70">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <div className="font-weight-bold h1 text-uppercase">{t("demo5.services.heading")}</div>
          </div>
        </div>

        {/* Phones (<768px): the auto-rotating marquee below is replaced by a
            compact 3-column tile grid so every service is visible at once.
            Tiles call the same handleClick, so routing is identical. */}
        <div className="row d-md-none">
          <div className="col-12">
            <div className="m-tile-grid m-tile-grid--services">
              {highlights.map((item, index) => {
                const title = serviceTitle(item);
                return (
                  <button
                    type="button"
                    key={`${item.nameId || item.name || item.title || "service"}-m-${index}`}
                    className="m-tile m-tile--service"
                    onClick={() => handleClick(item)}
                  >
                    <span className="m-tile-icon">
                      {renderServiceIcon(item.name, 34)}
                    </span>
                    <span className="m-tile-title">{title}</span>
                    {isComingSoonService(item.name || item.title) ? (
                      <span className="m-tile-badge">
                        {t("common.comingSoon")}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tablet/desktop (>=768px): unchanged marquee (drag, pause, clones). */}
        <div className="row d-none d-md-block">
          <section className="services-wrapper col-lg-12">
            <div
              className="services-marquee"
              ref={marqueeRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={(e) => {
                setIsPaused(false);
                handleMouseLeave(e);
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div className={`services-track-rtl ${isPaused ? "paused" : ""}`}>
                {combinedFeatures.map((item, index) => {
                  // Second half = the marquee clone the -50% animation needs.
                  // Keep it out of the accessibility tree so screen readers and
                  // translation audits do not report every title twice.
                  const isClone = index >= highlights.length;
                  const cardKey = `${
                    item.nameId || item.name || item.title || "service"
                  }-${index}`;

                  return (
                    <div
                      className="service-card"
                      key={cardKey}
                      aria-hidden={isClone || undefined}
                      onClick={() => handleClick(item)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="service-nav-link-dept">
                        <div className="service-icon-dept">
                          {item.icon || renderServiceIcon(item.name)}
                        </div>
                        <div className="service-title-dept font-weight-bold">
                          {serviceTitle(item)}
                        </div>
                        {/* Reserved band on *every* card (empty when the
                            service is live) so a card with the pill is exactly
                            as tall as one without it - see
                            `.service-coming-soon-slot` in customStyle.css. */}
                        <div className="service-coming-soon-slot">
                          {isComingSoonService(item.name || item.title) ? (
                            <div className="service-coming-soon">
                              {t("common.comingSoon")}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Demo5Services1;
