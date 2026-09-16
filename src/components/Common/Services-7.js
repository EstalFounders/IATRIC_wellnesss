import Link from "next/link";
import React, { useState } from "react";
import PopupDialog from "./PopupDialog";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import { Button } from "react-bootstrap";
import { contact_no } from "../../constant";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";

const Services7 = () => {
  const { t } = useLanguage();
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);

  const handleDialDialogOpen = () => {
    setIsDialDialogOpen(true);
  };

  const handleCloseDialDialog = () => {
    setIsDialDialogOpen(false);
  };

  const dialOptions = [
    { label: t("contacts1.dial"), action: dial },
    { label: t("contacts1.whatsapp"), action: openSupportWhatsAppWeb },
  ];

  return (
    <section
      id="services-7"
      className="bg-lightgrey wide-70 services-section division"
    >
      <div className="container">
        <div className="row">
          {/* SERVICE BOXES */}
          <div className="col-lg-8">
            <div className="row align-items-stretch">
              {/* SERVICE BOX #1 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="0.4s">
                  <Link legacyBehavior href="/service-1">
                    <a>
                      <span className="flaticon-137-doctor blue-color" />
                      <div className="sbox-7-txt">
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title1")}
                        </h5>
                        <p className="p-sm">
                          {richText(t("s7.p1"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #1 */}
              {/* SERVICE BOX #2 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="0.6s">
                  <Link legacyBehavior href="/service-2">
                    <a>
                      {/* Icon */}
                      <span className="flaticon-076-microscope blue-color" />
                      {/* Text */}
                      <div className="sbox-7-txt">
                        {/* Title */}
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title2")}
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          {richText(t("s7.p2"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #2 */}
              {/* SERVICE BOX #3 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="0.8s">
                  <Link legacyBehavior href="/service-1">
                    <a>
                      {/* Icon */}
                      <span className="flaticon-065-hospital-bed blue-color" />
                      {/* Text */}
                      <div className="sbox-7-txt">
                        {/* Title */}
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title3")}
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          {richText(t("s7.p3"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #3*/}
              {/* SERVICE BOX #4 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="1s">
                  <Link legacyBehavior href="/service-2">
                    <a>
                      {/* Icon */}
                      <span className="flaticon-058-blood-transfusion-2 blue-color" />
                      {/* Text */}
                      <div className="sbox-7-txt">
                        {/* Title */}
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title4")}
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          {richText(t("s7.p4"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #4 */}
              {/* SERVICE BOX #5 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="1.2s">
                  <Link legacyBehavior href="/service-1">
                    <a>
                      {/* Icon */}
                      <span className="flaticon-141-clinic-history blue-color" />
                      {/* Text */}
                      <div className="sbox-7-txt">
                        {/* Title */}
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title5")}
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          {richText(t("s7.p5"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #5 */}
              {/* SERVICE BOX #6 */}
              <div className="col-md-6 mb-4">
                <div className="sbox-7 icon-xs h-100" data-wow-delay="1.4s">
                  <Link legacyBehavior href="/service-2">
                    <a>
                      {/* Icon */}
                      <span className="flaticon-008-ambulance-6 blue-color" />
                      {/* Text */}
                      <div className="sbox-7-txt">
                        {/* Title */}
                        <h5 className="h5-sm steelblue-color">
                          {t("s7.title6")}
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          {richText(t("s7.p5"))}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </div>
              {/* END SERVICE BOX #6 */}
            </div>
          </div>
          {/* END SERVICE BOXES */}
          {/* INFO TABLE */}
          <div className="col-lg-4">
            <div
              className="services-7-table blue-table mb-30"
              data-wow-delay="0.6s"
            >
              {/* Title */}
              <h4 className="h4-xs">
                {t("s7.h4")}
              </h4>
              {/* Text */}
              <p className="p-md">
                {t("s7.p")}
              </p>
              {/* Table */}
              <table className="table">
                <tbody>
                  <tr>
                    <td>{t("s7.day1")}</td>
                    <td> - </td>
                    <td className="text-right">{t("s7.time")}</td>
                  </tr>
                  <tr>
                    <td>{t("s7.day2")}</td>
                    <td>-</td>
                    <td className="text-right">{t("s7.time")}</td>
                  </tr>
                  <tr>
                    <td>{t("s7.day3")}</td>
                    <td>-</td>
                    <td className="text-right">{t("s7.time")}</td>
                  </tr>
                </tbody>
              </table>
              {/* Title */}
              {/* <h5 className="h5-sm">Need a personal health plan?</h5> */}
              {/* Text */}
              <p className="h5 box-list">
                {t("s7.contactCta")}
                <br />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDialDialogOpen();
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#000000";
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                    marginTop: "20px",
                  }}
                >
                  {t("s7.callLabel")}{" "}
                  <a
                    href={`tel:${contact_no}`}
                    style={{
                      fontFamily: "bold",
                      textDecoration: "none",
                      color: "#000000",
                    }}
                  >
                    {contact_no}
                  </a>
                </Button>
              </p>
            </div>
            <PopupDialog
              isOpen={isDialDialogOpen}
              onClose={handleCloseDialDialog}
              options={dialOptions}
            />
          </div>
          {/* END INFO TABLE */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Services7;
