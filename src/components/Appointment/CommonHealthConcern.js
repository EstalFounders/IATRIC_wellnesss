import React, { useRef } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { healthConcerns } from "../../../data/HealthConcern";
import { HorizontalScrollContainer } from "../labTestComponent/common/HorizontalContainer";
import { ConsultationButton } from "../Common/commonUi";
import { booking_btn_txt } from "../../constant";

const CommonHealthConcerns = () => {
  const { t } = useLanguage();
  return (
    <div className="container py-5 health-concerns m-section">
      <div className="m-section-head">
        <h3 className="h3-md text-dark text-center m-section-title">
          {t("chc.title")}
        </h3>
        <div className="text-muted text-center text-md-start mb-md-4 m-section-sub">
          {t("chc.sub")}
        </div>
      </div>
      <div className="row">
        {/* Phones (<768px): the horizontal slider below is replaced by a compact
            2-column grid so every concern is on screen at once. Each tile is the
            same <ConsultationButton> (same path, same handler), so tapping a
            tile books exactly like tapping the card's "Book Now" did. */}
        <div className="col-12 d-md-none">
          <div className="m-tile-grid m-tile-grid--concerns">
            {healthConcerns.map((item, index) => (
              <ConsultationButton
                key={index}
                variant="outline"
                className="m-tile m-tile--concern"
                path="/appointment#appointment-form"
              >
                <img
                  src={item.image}
                  className="m-tile-img"
                  alt=""
                  loading="lazy"
                />
                <span className="m-tile-body">
                  <span className="m-tile-title">{item.title}</span>
                  <span className="m-tile-cta">{booking_btn_txt}</span>
                </span>
              </ConsultationButton>
            ))}
          </div>
        </div>

        {/* Tablet/desktop (>=768px): unchanged horizontal scroll container. */}
        <div className="d-none d-md-block w-100">
          <HorizontalScrollContainer>
            {healthConcerns.map((item, index) => (
              <div
                key={index}
                className="card flex-shrink-0"
                style={{ minWidth: "240px", maxWidth: "280px" }}
              >
                <img
                  src={item.image}
                  className="card-img-top"
                  alt={item.title}
                  style={{ height: "160px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">{item.title}</h5>
                  <ConsultationButton
                    variant="book-now"
                    path="/appointment#appointment-form"
                  >
                    {booking_btn_txt}
                  </ConsultationButton>
                </div>
              </div>
            ))}
          </HorizontalScrollContainer>
        </div>
      </div>
    </div>
  );
};

export default CommonHealthConcerns;
