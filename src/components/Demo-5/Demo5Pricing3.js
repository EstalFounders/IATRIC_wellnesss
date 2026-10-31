import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo5Pricing3 = () => {
  const { t } = useLanguage();
  return (
    <section id="pricing-3" className="wide-60 pricing-section division">
      <div className="container">
        <div className="row d-flex align-items-center">
          {/* PRICING TABLE */}
          <div className="col-lg-6">
            <div className="txt-block pc-30 mb-40">
              {/* Section ID */}
              <span
                className="blue-color"
                style={{ fontSize: "1.8rem", fontWeight: "600" }}
              >
                {t("demo5.pricing.tag")}
              </span>
              {/* Title */}
              <h3 className="h3-md steelblue-color">
                {t("demo5.pricing.title")}
              </h3>
              {/* Text */}
              <p className="h5 box-list grey-color">
                {t("demo5.pricing.desc")}
              </p>
              <p className="h5 box-list grey-color">
                {t("demo5.pricing.explore")}
              </p>
              <div className="pricing-table mb-40 h5 box-list grey-color">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">{t("demo5.pricing.service")}</th>
                      <th scope="col">{t("demo5.pricing.price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>{t("demo5.pricing.xray")}</td>
                      <td>
                        <span className="text-muted">{t("common.comingSoon")}</span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>{t("demo5.pricing.mri")}</td>
                      <td>
                        <span className="text-muted">{t("common.comingSoon")}</span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>{t("demo5.pricing.ct")}</td>
                      <td>
                        <span className="text-muted">{t("common.comingSoon")}</span>
                      </td>
                    </tr>
                    <tr className="last-tr">
                      <th scope="row">4</th>
                      <td>{t("demo5.pricing.lab")}</td>
                      <td>
                        <span className="text-muted">{t("common.comingSoon")}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* END PRICING TABLE */}
          {/* PRICING IMAGE */}
          <div className="col-lg-6">
            <div className="pricing-img">
              <Image
                placeholder="blur"
                blurDataURL={imageBlurDataUrl}
                width={600}
                height={550}
                className="img-fluid"
                src="/images/image-04.jpeg"
                alt="pricing-image"
                style={{ borderRadius: "20%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Pricing3;
