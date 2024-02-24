import Link from "next/dist/client/link";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

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
                src="images/logo.png"
                width={180}
                height={40}
                alt="footer-logo"
              />
              {/* Text */}
              <p className="p-sm mt-20">
                Aliquam orci nullam tempor sapien gravida donec an enim ipsum
                porta justo at velna auctor congue
              </p>
              {/* Social Icons */}
              <div className="footer-socials-links mt-10">
                <Row>
                  <Col
                    className="border text-center mx-1"
                    style={{ borderRadius: 20 }}
                  >
                    <a
                      className="linkedinicon mx-2"
                      title="Linkedin"
                      target="blank"
                      href="https://www.linkedin.com/in/iatrichealthcare/"
                    >
                      <FaLinkedin />
                      <span className="mobiletext02">Linkedin</span>
                    </a>
                  </Col>
                  <Col
                    className="border text-center mx-1"
                    style={{ borderRadius: 20 }}
                  >
                    <a
                      className="instagramicon mx-2"
                      title="Instagram"
                      target="blank"
                      href="https://www.instagram.com/iatric.healthcare/"
                    >
                      <FaInstagram />
                      <span className="mobiletext02">Instagram</span>
                    </a>
                  </Col>

                  {/* <a className="twittericon" title="Twitter" href="#">
              <i className="fab fa-twitter" />
              <span className="mobiletext02">Twitter</span>
            </a> */}
                  <Col
                    className="border text-center mx-1"
                    style={{ borderRadius: 20 }}
                  >
                    <a
                      className="facebookicon mx-2"
                      title="Facebook"
                      target="blank"
                      href="https://www.facebook.com/iatrichealthcare"
                    >
                      <FaFacebook />
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
                E:
                <Link legacyBehavior href="#">
                  <a href="mailto:yourdomain@mail.com">
                    iatrichealthcare@gmail.com
                  </a>
                </Link>
              </p>
              {/* Phone */}
              <p>P: +91 96259 42020</p>
            </div>
          </div>
          {/* FOOTER WORKING HOURS */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <h5 className="h5-xs">Working Time</h5>
              {/* Working Hours */}
              <p className="p-sm">
                Mon - Wed - <span>9:00 AM - 8:00 PM</span>
              </p>
            </div>
          </div>
          {/* FOOTER PHONE NUMBER */}
          <div className="col-md-6 col-lg-3">
            <div className="footer-box mb-40">
              {/* Title */}
              <h5 className="h5-xs">Emergency Cases</h5>
              {/* Footer List */}
              <h5 className="h5-xl blue-color">1-800-123-4560</h5>
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
                © {new Date().getFullYear()} <span>Iatric Healthcare</span>. All Rights
                Reserved
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
