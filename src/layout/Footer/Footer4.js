import Link from "next/dist/client/link";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPhoneAlt,
} from "react-icons/fa";
import { address, contact_no, email, facebook_page_url } from "../../constant";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import PopupDialog from "../../components/Common/PopupDialog";
import { useRouter } from "next/router";
import { MdEmail } from "react-icons/md";

const Footer4 = () => {
  const router = useRouter();
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const handleDialDialogOpen = () => {
    setIsDialDialogOpen(true);
  };
  const handleCloseDialDialog = () => {
    setIsDialDialogOpen(false);
  };

  const dialOptions = [
    { label: "Dial", action: dial },
    { label: "Whatsapp", action: openSupportWhatsAppWeb },
  ];

  const handleEmail = () => {
    router.push(`mailto:${email}`);
  };

  return (
    <footer className="bg-image wide-40 footer division text-secondary">
      <div className="container h5 box-list">
        {/* FOOTER CONTENT */}
        <div className="row">
          {/* FOOTER INFO */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-info mb-40">
              {/* Footer Logo */}
              {/* For Retina Ready displays take a image with double the amount of pixels that your image will be displayed (e.g 360 x 80  pixels) */}
              <img
                src="/images/logo-grey.png"
                width={180}
                height={40}
                alt="footer-logo"
              />
              {/* Text */}
              <div className="p-sm mt-20">Unlocking your well-being</div>
              <div className="p-sm mb-4">one step at a time.</div>
              {/* Social Icons */}
              <div className="footer-socials-links mt-10">
                <Row>
                  <Col className="text-center" md={2}>
                    <a
                      className="linkedinicon"
                      title="Linkedin"
                      target="blank"
                      href="https://www.linkedin.com/in/iatrichealthcare/"
                    >
                      <FaLinkedin size={40} color="#0077b5" />
                      <span className="mobiletext02">Linkedin</span>
                    </a>
                  </Col>
                  <Col className="text-center" md={2}>
                    <a
                      className="instagramicon"
                      title="Instagram"
                      target="blank"
                      href="https://www.instagram.com/iatric.healthcare/"
                    >
                      <FaInstagram size={40} color="#cd486b" />
                      <span className="mobiletext02">Instagram</span>
                    </a>
                  </Col>

                  {/* <a className="twittericon" title="Twitter" href="#">
              <i className="fab fa-twitter" />
              <span className="mobiletext02">Twitter</span>
            </a> */}
                  <Col className="text-center" md={2}>
                    <a
                      className="facebookicon"
                      title="Facebook"
                      target="blank"
                      href={facebook_page_url}
                    >
                      <FaFacebook size={40} color="#316FF6" />
                      <span className="mobiletext02">Facebook</span>
                    </a>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          {/* FOOTER CONTACTS */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <div className="h5-xs font-weight-bold text-dark mb-4">
                <u>Our Location</u>
              </div>
              {/* Address */}
              <div>{address}</div>
              {/* Email */}
              <div className="foo-email mt-20 d-flex flex-row">
                <div>
                  <MdEmail />
                </div>
                <div>
                  <a
                    className="ml-2"
                    onClick={(e) => {
                      handleEmail();
                      e.preventDefault();
                    }}
                  >
                    {email}
                  </a>
                </div>
              </div>
              {/* Phone */}
              <div className="d-flex flew-row">
                <div className="mr-2">
                  <FaPhoneAlt />{" "}
                </div>
                <div>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                  >
                    {contact_no}
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* FOOTER WORKING HOURS */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <div className="h5-xs font-weight-bold text-dark mb-4">
                <u>Working Time</u>
              </div>
              {/* Working Hours */}
              <div className="p-sm text-nowrap">
                Mon - Sun - 8:00 AM - 8:00 PM
              </div>
            </div>
          </div>
          {/* FOOTER PHONE NUMBER */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <div className="h5-xs font-weight-bold text-dark mb-4">
                <u>Emergency Cases</u>
              </div>
              {/* Footer List */}
              <div className="h5-xl">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleDialDialogOpen();
                  }}
                >
                  <FaPhoneAlt /> {contact_no}
                </a>
              </div>
              {/* Text */}
              <div className="p-sm mt-15">
                Aliquam orci nullam undo tempor sapien gravida donec enim ipsum
                porta justo velna aucto magna
              </div>
            </div>
          </div>
        </div>
        {/* END FOOTER CONTENT */}
        {/* FOOTER COPYRIGHT */}
        <div className="bottom-footer">
          <div className="row">
            <div className="col-md-12 text-righ text-dark">
              <p className="footer-copyright text-dark text-right">
                {new Date().getFullYear()} ©{" "}
                <span className="text-dark">TTANSHE HEALTHPATH PRIVATE LIMITED</span>. All Rights
                Reserved
              </p>
            </div>
          </div>
        </div>
      </div>
      <PopupDialog
        isOpen={isDialDialogOpen}
        onClose={handleCloseDialDialog}
        options={dialOptions}
      />
      {/* End container */}
    </footer>
  );
};

export default Footer4;
