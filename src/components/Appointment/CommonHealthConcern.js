import React, { useRef } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { healthConcerns } from "../../../data/HealthConcern";
import { HorizontalScrollContainer } from "../labTestComponent/common/HorizontalContainer";
import { ConsultationButton } from "../Common/commonUi";
import { booking_btn_txt } from "../../constant";

const CommonHealthConcerns = () => {
  const { t } = useLanguage();
  return (
    <div className="container py-5">
      <h3 className="h3-md text-dark text-center">
        {t("chc.title")}
      </h3>
      <div className="text-muted text-center text-md-start mb-4">
        {t("chc.sub")}
      </div>
      <div className="row">
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
                <p className="card-text text-muted">&#8377; {item.price}</p>
                <ConsultationButton variant="book-now" path="/appointment">
                  {booking_btn_txt}
                </ConsultationButton>
              </div>
            </div>
          ))}
        </HorizontalScrollContainer>
      </div>
    </div>
  );
};

export default CommonHealthConcerns;
