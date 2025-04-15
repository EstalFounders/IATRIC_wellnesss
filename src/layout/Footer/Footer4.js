import Link from "next/dist/client/link";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { contact_no, email } from "../../constant";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import PopupDialog from "../../components/Common/PopupDialog";
import { useRouter } from "next/router";

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
    <footer className="bg-image wide-40 footer division">
      <div className="container">
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
              <p className="p-sm mt-20">Unlocking your well-being</p>
              <p className="p-sm mb-4">one step at a time.</p>
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
                      href="https://www.facebook.com/iatrichealthcare"
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
              <h5 className="h5-xs">Our Location</h5>
              {/* Address */}
              <p>Sector 57 ,</p>
              <p>Gurgaon Haryana-122003</p>
              {/* Email */}
              <p className="foo-email mt-20">
                Email:
                <Link legacyBehavior href="#">
                  <a
                    className="ml-2"
                    onClick={(e) => {
                      handleEmail();
                      e.preventDefault();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#000000";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#ffffff";
                    }}
                  >
                    {email}
                  </a>
                </Link>
              </p>
              {/* Phone */}
              <p>
                Phone:{" "}
                <Link legacyBehavior href="#">
                  <a
                    style={{ color: "#ffffff" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#000000";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#ffffff";
                    }}
                  >
                    {contact_no}
                  </a>
                </Link>
              </p>
            </div>
          </div>
          {/* FOOTER WORKING HOURS */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <h5 className="h5-xs">Working Time</h5>
              {/* Working Hours */}
              <p className="p-sm">
                Mon - Sun - <span>9:00 AM - 8:00 PM</span>
              </p>
            </div>
          </div>
          {/* FOOTER PHONE NUMBER */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <h5 className="h5-xs">Emergency Cases</h5>
              {/* Footer List */}
              <h5 className="h5-xl blue-color">
                <Link legacyBehavior href="#">
                  <a
                    style={{ color: "#8e8333" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#000000";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#8e8333";
                    }}
                  >
                    <FaPhoneAlt /> {contact_no}
                  </a>
                </Link>
              </h5>
              {/* Text */}
              <p className="p-sm mt-15">
                Aliquam orci nullam undo tempor sapien gravida donec enim ipsum
                porta justo velna aucto magna
              </p>
            </div>
          </div>
        </div>
        {/* END FOOTER CONTENT */}
        {/* FOOTER COPYRIGHT */}
        <div className="bottom-footer">
          <div className="row">
            <div className="col-md-12 text-right">
              <p className="footer-copyright">
              {new Date().getFullYear()} ©  <span>TTANSHE HEALTHPATH PRIVATE LIMITED</span>. All
                Rights Reserved
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
