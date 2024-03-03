import Link from "next/dist/client/link";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { contact_no } from "../../constant";

const Footer4 = () => {
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
                src="images/logo-grey.png"
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
                      <FaInstagram size={40} color="#fccc63" />
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
                  <a href="mailto:yourdomain@mail.com" className="ml-2">
                    iatrichealthcare@gmail.com
                  </a>
                </Link>
              </p>
              {/* Phone */}
              <p>Phone: {contact_no}</p>
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
              <h5 className="h5-xl blue-color">{contact_no}</h5>
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
            <div className="col-md-12">
              <p className="footer-copyright">
                © {new Date().getFullYear()} <span>Iatric Healthcare</span>. All
                Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* End container */}
    </footer>
  );
};

export default Footer4;
