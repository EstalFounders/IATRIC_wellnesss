import Link from "next/link";
import React from "react";
import MobileMenu from "../MobileMenu";
import { Col, Container, Row } from "react-bootstrap";

const Header1 = ({ toggleMenu, toggle }) => {
  return (
    <header id="header" className="header">
      {/* MOBILE HEADER */}
      <div className="wsmobileheader clearfix">
        <Link legacyBehavior href="#">
          <a
            id="wsnavtoggle"
            onClick={() => toggleMenu()}
            className="wsanimated-arrow"
          >
            <span />
          </a>
        </Link>
        <span className="smllogo">
          <img
            src="images/logo.png"
            width={180}
            height={50}
            alt="mobile-logo"
          />
        </span>
        <Link legacyBehavior href="#">
          <a href="tel:123456789" className="callusbtn">
            <i className="fas fa-phone" />
          </a>
        </Link>
      </div>
      {/* HEADER STRIP */}
      {/* remove code for header strip as it was not mobile responsive */}
      {/* END HEADER STRIP */}
      {/* NAVIGATION MENU */}
      <div className="wsmainfull menu clearfix d-none d-lg-block">
        <div className="wsmainwp clearfix">
          {/* LOGO IMAGE */}
          {/* For Retina Ready displays take a image with double the amount of pixels that your image will be displayed (e.g 360 x 80 pixels) */}
          <div className="desktoplogo">
            <a href="#">
              <img
                src="images/logo.png"
                width={280}
                height={65}
                alt="header-logo"
              />
            </a>
          </div>
          {/* MAIN MENU */}
          <nav className="wsmenu clearfix">
            <ul className="wsmenu-list">
              {/* DROPDOWN MENU */}
              <li aria-haspopup="true">
                <Link legacyBehavior href="/">
                  <a>
                    Home <span className="wsarrow" />
                  </a>
                </Link>
              </li>
              {/* END DROPDOWN MENU */}
              {/* PAGES */}
              <li aria-haspopup="true">
                <a href="#">
                  Pages <span className="wsarrow" />
                </a>
                <div className="wsmegamenu clearfix">
                  <div className="container">
                    <div className="row">
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        <li className="title">Standard Pages:</li>
                        <li>
                          <Link legacyBehavior href="/about-us">
                            <a>About Us</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/who-we-are">
                            <a>Who We Are</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/all-services">
                            <a>Our Services</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/service-1">
                            <a>Get In Touch</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        <li className="title">Medical Pages:</li>
                        <li>
                          <Link legacyBehavior href="/all-departments">
                            <a>Our Departments</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/department-single">
                            <a>Department Single</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/all-doctors">
                            <a>Meet the Doctors</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        <li className="title">Special Pages:</li>
                        <li>
                          <Link legacyBehavior href="/pricing-1">
                            <a>Pricing Packages #1</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/pricing-2">
                            <a>Pricing Packages #2</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/appointment">
                            <a>Make an Appointment</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/faqs">
                            <a>FAQs Page</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/terms">
                            <a>Terms of Use</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        <li className="title">Auxiliary Pages:</li>
                        <li>
                          <Link legacyBehavior href="/gallery">
                            <a>Our Gallery</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-listing">
                            <a>Blog Listing Page</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/single-post">
                            <a>Single Blog Post</a>
                          </Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/contacts-2">
                            <a>Contact Us #2</a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    {/* End row */}
                  </div>
                  {/* End container */}
                </div>
                {/* End wsmegamenu */}
              </li>
              {/* END PAGES */}
              {/* HALF MENU */}
              <li aria-haspopup="true">
                <a href="#">
                  Half Menu <span className="wsarrow" />
                </a>
                <div className="wsmegamenu clearfix halfmenu">
                  <div className="container-fluid">
                    <div className="row">
                      {/* Links */}
                      <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                        <li className="title">For Patients:</li>
                        <li>
                          <a href="#">Meet The Doctors</a>
                        </li>
                        <li>
                          <a href="#">Patient Info Sheets</a>
                        </li>
                        <li>
                          <a href="#">Online Patients Portal</a>
                        </li>
                        <li>
                          <a href="#">Patients Testimonials</a>
                        </li>
                        <li>
                          <a href="#">Blog &amp; Latest News</a>
                        </li>
                      </ul>
                      {/* Links */}
                      <ul className="col-lg-6 col-md-12 col-xs-12 link-list">
                        <li className="title">Quick Links:</li>
                        <li>
                          <a href="#">Terms &amp; Privacy Policy</a>
                        </li>
                        <li>
                          <a href="#">Donor Privacy Policy</a>
                        </li>
                        <li>
                          <a href="#">Workers Compensation</a>
                        </li>
                        <li>
                          <a href="#">Insurance Information</a>
                        </li>
                        <li>
                          <a href="#">After Hours Care</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
              {/* END HALF MENU */}
              {/* MEGAMENU */}
              <li aria-haspopup="true">
                <a href="#">
                  Mega Menu <span className="wsarrow" />
                </a>
                <div className="wsmegamenu clearfix">
                  <div className="container">
                    <div className="row">
                      {/* MEGAMENU QUICK LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        <li className="title">Quick Links:</li>
                        <li>
                          <a href="#">For Referring Doctors</a>
                        </li>
                        <li>
                          <a href="#">Terms &amp; Privacy Policy</a>
                        </li>
                        <li>
                          <a href="#">Donor Privacy Policy</a>
                        </li>
                        <li>
                          <a href="#">Patient Info Sheets</a>
                        </li>
                        <li>
                          <a href="#">Online Patients Portal</a>
                        </li>
                        <li>
                          <a href="#">Insurance Information</a>
                        </li>
                        <li>
                          <a href="#">Patients Testimonials</a>
                        </li>
                      </ul>
                      {/* MEGAMENU FEATURED NEWS */}
                      <div className="col-lg-5 col-md-12 col-xs-12">
                        {/* Title */}
                        <h3 className="title">Featured News:</h3>
                        {/* Image */}
                        <div className="fluid-width-video-wrapper">
                          <img
                            src="images/blog/featured-news.jpg"
                            alt="featured-news"
                          />
                        </div>
                        {/* Text */}
                        <h5 className="h5-xs">
                          <a href="#">5 Benefits of integrative medicine</a>
                        </h5>
                        <p className="wsmwnutxt">
                          Porta semper lacus cursus, feugiat primis ultrice in
                          ligula risus auctor tempus feugiat dolor impedit magna
                          purus at pretium gravida donec
                        </p>
                      </div>
                      {/* END MEGAMENU FEATURED NEWS */}
                      {/* MEGAMENU LATEST NEWS */}
                      <div className="col-lg-4 col-md-12 col-xs-12">
                        {/* Title */}
                        <h3 className="title">Latest News:</h3>
                        {/* Latest News */}
                        <ul className="latest-news">
                          {/* Post #1 */}
                          <li className="clearfix d-flex align-items-center">
                            {/* Image */}
                            <img
                              className="img-fluid"
                              src="images/blog/latest-post-1.jpg"
                              alt="blog-post-preview"
                            />
                            {/* Text */}
                            <div className="post-summary">
                              <Link legacyBehavior href="/single-post">
                                <a>
                                  Etiam sapien risus ante auctor tempus accumsan
                                  an empor ...
                                </a>
                              </Link>
                              <p>43 Comments</p>
                            </div>
                          </li>
                          {/* Post #2 */}
                          <li className="clearfix d-flex align-items-center">
                            {/* Image */}
                            <img
                              className="img-fluid"
                              src="images/blog/latest-post-2.jpg"
                              alt="blog-post-preview"
                            />
                            {/* Text */}
                            <div className="post-summary">
                              <Link legacyBehavior href="/single-post">
                                <a>
                                  Blandit tempor a sapien ipsum, porta risus
                                  auctor justo ...
                                </a>
                              </Link>
                              <p>38 Comments</p>
                            </div>
                          </li>
                          {/* Post #3 */}
                          <li className="clearfix d-flex align-items-center">
                            {/* Image */}
                            <img
                              className="img-fluid"
                              src="images/blog/latest-post-3.jpg"
                              alt="blog-post-preview"
                            />
                            {/* Text */}
                            <div className="post-summary">
                              <Link legacyBehavior href="/single-post">
                                <a>
                                  Cursus risus auctor tempus risus laoreet
                                  turpis auctor varius ...
                                </a>
                              </Link>
                              <p>29 Comments</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      {/* END MEGAMENU LATEST NEWS */}
                    </div>
                    {/* End row */}
                  </div>
                  {/* End container */}
                </div>
                {/* End wsmegamenu */}
              </li>
              {/* END MEGAMENU */}
              {/* SIMPLE NAVIGATION LINK */}
              <li className="nl-simple" aria-haspopup="true">
                <a href="#">Simple Link</a>
              </li>
              {/* NAVIGATION MENU BUTTON */}
              <li className="nl-simple header-btn" aria-haspopup="true">
                <Link legacyBehavior href="/appointment">
                  <a>Make an Appointment</a>
                </Link>
              </li>
            </ul>
          </nav>
          {/* END MAIN MENU */}
        </div>
      </div>
      <MobileMenu />
      {/* END NAVIGATION MENU */}
    </header>
  );
};

export default Header1;
