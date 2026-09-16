import Link from "next/link";
import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const Contacts02 = () => {
  const { t } = useLanguage();
  return (
    <section id="contacts-2" className="wide-60 contacts-section division">
      <div className="container">
        <div className="row">
          {/* CONTACTS INFO */}
          <div className="col-lg-7">
            {/* Title*/}
            <h4 className="h4-md steelblue-color">
              {t("contacts2.title")}
            </h4>
            {/* Text*/}
            <p className="contact-notice">{t("contacts2.notice")}</p>
            <div className="row">
              {/* CITY CONTACT DATA */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  {/* City */}
                  <h5 className="h5-sm steelblue-color">Sydney</h5>
                  <p>121 King Street, Melbourne,</p>
                  <p>Victoria 3000 Australia</p>
                  <p>{t("contacts2.phoneLabel")} 1-(800)-569-7890</p>
                  <p>
                    {t("contacts2.emailLabel")}
                    <Link legacyBehavior href="#">
                      <a
                        href="mailto:yourdomain@mail.com"
                        className="blue-color"
                      >
                        hello@yourdomain.com
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
              {/* CITY CONTACT DATA */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  {/* City */}
                  <h5 className="h5-sm steelblue-color">Melbourne</h5>
                  <p>121 King Street, Melbourne,</p>
                  <p>Victoria 3000 Australia</p>
                  <p>{t("contacts2.phoneLabel")} 1-(800)-569-7890</p>
                  <p>
                    {t("contacts2.emailLabel")}
                    <Link legacyBehavior href="#">
                      <a
                        href="mailto:yourdomain@mail.com"
                        className="blue-color"
                      >
                        hello@yourdomain.com
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
              {/* CITY CONTACT DATA */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  {/* City */}
                  <h5 className="h5-sm steelblue-color">Brisbane</h5>
                  <p>121 King Street, Melbourne,</p>
                  <p>Victoria 3000 Australia</p>
                  <p>{t("contacts2.phoneLabel")} 1-(800)-569-7890</p>
                  <p>
                    {t("contacts2.emailLabel")}
                    <Link legacyBehavior href="#">
                      <a
                        href="mailto:yourdomain@mail.com"
                        className="blue-color"
                      >
                        hello@yourdomain.com
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
              {/* CITY CONTACT DATA */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  {/* City */}
                  <h5 className="h5-sm steelblue-color">Adelaide</h5>
                  <p>121 King Street, Melbourne,</p>
                  <p>Victoria 3000 Australia</p>
                  <p>{t("contacts2.phoneLabel")} 1-(800)-569-7890</p>
                  <p>
                    {t("contacts2.emailLabel")}
                    <Link legacyBehavior href="#">
                      <a
                        href="mailto:yourdomain@mail.com"
                        className="blue-color"
                      >
                        hello@yourdomain.com
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* END CONTACTS INFO */}
          {/* CONTACT FORM */}
          <div className="col-lg-5">
            <div className="form-holder mb-40">
              <form
                name="contactForm"
                onSubmit={(e) => e.preventDefault()}
                className="row contact-form"
              >
                {/* Contact Form Input */}
                <div id="input-name" className="col-md-12">
                  <input
                    type="text"
                    name="name"
                    className="form-control name"
                    placeholder={t("contacts2.phName")}
                    required
                  />
                </div>
                <div id="input-email" className="col-md-12">
                  <input
                    type="text"
                    name="email"
                    className="form-control email"
                    placeholder={t("contacts2.phEmail")}
                    required
                  />
                </div>
                <div id="input-phone" className="col-md-12">
                  <input
                    type="tel"
                    name="phone"
                    className="form-control phone"
                    placeholder={t("contacts2.phPhone")}
                    required
                  />
                </div>
                {/* Form Select */}
                <div id="input-patient" className="col-md-12 input-patient">
                  <select
                    id="inlineFormCustomSelect3"
                    name="patient"
                    className="custom-select patient"
                    required
                  >
                    <option>{t("contacts2.optVisited")}</option>
                    <option>{t("contacts2.optNew")}</option>
                    <option>{t("contacts2.optReturning")}</option>
                    <option>{t("contacts2.optOther")}</option>
                  </select>
                </div>
                <div id="input-subject" className="col-md-12">
                  <input
                    type="text"
                    name="subject"
                    className="form-control subject"
                    placeholder={t("contacts2.phSubject")}
                    required
                  />
                </div>
                <div id="input-message" className="col-md-12 input-message">
                  <textarea
                    className="form-control message"
                    name="message"
                    rows={6}
                    placeholder={t("contacts2.phMessage")}
                    required
                    defaultValue=""
                  />
                </div>
                {/* Contact Form Button */}
                <div className="col-lg-12 mt-15 form-btn">
                  <button
                    type="submit"
                    className="btn btn-blue blue-hover submit"
                  >
                    {t("contacts2.submit")}
                  </button>
                </div>
                {/* Contact Form Message */}
                <div className="col-md-12 contact-form-msg text-center">
                  <div className="sending-msg">
                    <span className="loading" />
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* END CONTACT FORM */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Contacts02;
