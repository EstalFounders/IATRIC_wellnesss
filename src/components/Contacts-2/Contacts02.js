import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkedAlt } from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useLanguage } from "../../i18n/LanguageContext";
import { ConsultationButton } from "../Common/commonUi";
import PopupDialog from "../Common/PopupDialog";
import CircleLoader from "../circleLoader";
import {
  Linkdn_url,
  address,
  api,
  booking_btn_txt,
  contact_no,
  email,
  facebook_page_url,
  instagram_page_url,
} from "../../constant";
import { dial, isMobileValid, openSupportWhatsAppWeb } from "../../helper";

// Same rule the API uses to decide whether the single "phone or email" input
// holds an email address or a phone number.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The contact details mirror `src/layout/Footer/Footer4.js` (links + labels);
// only the icon colours differ, because this section sits on a light background
// while the footer is white-on-dark.
const SOCIAL_LINKS = [
  {
    title: "Facebook",
    href: facebook_page_url,
    Icon: FaFacebook,
    color: "#1877f2",
  },
  {
    title: "Instagram",
    href: instagram_page_url,
    Icon: FaInstagram,
    color: "#e1306c",
  },
  { title: "Linkedin", href: Linkdn_url, Icon: FaLinkedin, color: "#0a66c2" },
];

const EMPTY_FORM = { name: "", contact: "", message: "" };

const Contacts02 = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ ok: false, text: "" });
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);

  // Same two options the footer offers for the phone number.
  const dialOptions = [
    { label: t("footer.dial"), action: dial, icon: 0 },
    { label: t("footer.whatsapp"), action: openSupportWhatsAppWeb, icon: 1 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * The form collects exactly three compulsory fields (name, phone-or-email,
   * message). The `required` attributes cover the empty case for the browser and
   * the checks below re-assert it, then the single contact value is split into
   * `email` or `mobile_number` - the shape `POST /api/userQuery` expects.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const contact = formData.contact.trim();
    const message = formData.message.trim();

    if (!name || !contact || !message) {
      setStatus({ ok: false, text: t("contacts2.errRequired") });
      return;
    }

    const isEmail = EMAIL_REGEX.test(contact);
    const mobileDigits = contact.replace(/\D/g, "").slice(-10);

    if (!isEmail && !isMobileValid(mobileDigits)) {
      setStatus({ ok: false, text: t("contacts2.errContact") });
      return;
    }

    const payload = { name, message };
    if (isEmail) {
      payload.email = contact.toLowerCase();
    } else {
      payload.mobile_number = Number(mobileDigits);
    }

    setLoading(true);
    setStatus({ ok: false, text: "" });

    try {
      const res = await fetch(api.userQuery, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus({ ok: true, text: t("contacts2.okSaved") });
      setFormData(EMPTY_FORM);
    } catch {
      setStatus({ ok: false, text: t("contacts2.errFailed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contacts-2" className="wide-60 contacts-section division">
      <div className="container">
        {/* PAGE HEADING + CALLS TO ACTION */}
        <div className="contacts2-header">
          <h2 className="h2-xl steelblue-color contacts2-heading">
            {t("contacts2.heading", "Contact Us")}
          </h2>
          {/* Vertical CTA column: primary booking + secondary careers */}
          <div className="contacts2-actions">
            <ConsultationButton variant="book-now" path="/appointment">
              {booking_btn_txt}
            </ConsultationButton>
            <ConsultationButton variant="outline" path="/join-us">
              {t("contacts2.workWithUs", "Work With Us")}
            </ConsultationButton>
          </div>
        </div>

        <div className="row">
          {/* CONTACT DETAILS (footer content: reach us + hours + socials) */}
          <div className="col-lg-7">
            {/* Headline + description */}
            <h4 className="h4-md steelblue-color">
              {t(
                "contacts2.title",
                "Have a Question? We Review and Accept Patients Requests on 24/7 Basis."
              )}
            </h4>
            <p className="contact-notice">{t("contacts2.notice")}</p>
            <div className="row">
              {/* REACH US */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  <h5 className="h5-sm steelblue-color">
                    {t("footer.reachUs")}
                  </h5>
                  {/* Address */}
                  <p className="contacts2-info-line">
                    <FaMapMarkedAlt size={20} />
                    <span>{t("footer.address", address)}</span>
                  </p>
                  {/* Email */}
                  <p className="contacts2-info-line">
                    <MdEmail size={20} />
                    <a href={`mailto:${email}`} className="blue-color">
                      {email}
                    </a>
                  </p>
                  {/* Phone -> dial / whatsapp, exactly like Footer4 */}
                  <p className="contacts2-info-line">
                    <FaPhoneVolume size={20} />
                    <a
                      href={`tel:${contact_no.replace(/\s/g, "")}`}
                      className="blue-color"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDialDialogOpen(true);
                      }}
                    >
                      {contact_no}
                    </a>
                  </p>
                </div>
              </div>
              {/* WORKING HOURS + SOCIALS */}
              <div className="col-md-6">
                <div className="contact-box mb-40">
                  <h5 className="h5-sm steelblue-color">
                    {t("footer.workingHours")}
                  </h5>
                  <p>{t("footer.days")}</p>
                  <p>{t("footer.hours")}</p>
                </div>
                <div className="contact-box mb-40">
                  <h5 className="h5-sm steelblue-color">
                    {t("footer.followUs")}
                  </h5>
                  <div className="contacts2-socials">
                    {SOCIAL_LINKS.map(({ title, href, Icon, color }) => (
                      <a
                        key={title}
                        className={`${title.toLowerCase()}icon`}
                        title={title}
                        target="blank"
                        rel="noreferrer"
                        href={href}
                      >
                        <Icon size={32} color={color} />
                        <span className="mobiletext02">{title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END CONTACT DETAILS */}

          {/* CONTACT FORM (name + phone/email + message only) */}
          <div className="col-lg-5">
            <div className="form-holder mb-40">
              <form
                name="contactForm"
                onSubmit={handleSubmit}
                className="row contact-form"
              >
                {/* Name */}
                <div id="input-name" className="col-md-12">
                  <input
                    type="text"
                    name="name"
                    className="form-control name"
                    placeholder={t("contacts2.phName")}
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Single compulsory phone OR email input */}
                <div id="input-contact" className="col-md-12">
                  <input
                    type="text"
                    name="contact"
                    className="form-control contact"
                    placeholder={t("contacts2.phContact")}
                    required
                    value={formData.contact}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Message */}
                <div id="input-message" className="col-md-12 input-message">
                  <textarea
                    className="form-control message"
                    name="message"
                    rows={6}
                    placeholder={t("contacts2.phMessage")}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Contact Form Button */}
                <div className="col-lg-12 mt-15 form-btn d-flex align-items-center">
                  <button
                    type="submit"
                    className="btn btn-blue blue-hover submit"
                    disabled={loading}
                  >
                    {t("contacts2.submit")}
                  </button>
                  {loading ? (
                    <div className="ml-3">
                      <CircleLoader />
                    </div>
                  ) : null}
                </div>
              </form>
              {/* Contact Form Message */}
              <div
                className={`contacts2-form-status text-center font-weight-bold ${
                  status.ok ? "text-success" : "text-danger"
                }`}
              >
                {status.text}
              </div>
            </div>
          </div>
          {/* END CONTACT FORM */}
        </div>
        {/* End row */}
      </div>
      {/* End container */}
      <PopupDialog
        isOpen={isDialDialogOpen}
        onClose={() => setIsDialDialogOpen(false)}
        options={dialOptions}
      />
    </section>
  );
};

export default Contacts02;

