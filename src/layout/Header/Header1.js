import Link from "next/link";
import React, { useEffect, useState } from "react";
import MobileMenu from "../MobileMenu";
import { Col, Container, Row } from "react-bootstrap";
import {
  FaAudible,
  FaFacebook,
  FaHome,
  FaInstagram,
  FaLinkedin,
  FaMapMarkedAlt,
  FaPhone,
} from "react-icons/fa";
import {
  address,
  api,
  color_schema,
  contact_no,
  facebook_page_url,
  sessionStorageName,
} from "../../constant";
import PopupDialog from "../../components/Common/PopupDialog";
import { dial, navigate, openSupportWhatsAppWeb } from "../../helper";
import { useRouter } from "next/router";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

const Header1 = ({ toggleMenu, toggle, scrollToContact }) => {
  const router = useRouter();
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const [isConsultationTypeOpen, setIsConsultationTypeOpen] = useState(false);
  const [consultationTypes, setConsultationTypes] = useState();
  const hiddenRoutes = ["/appointment", "/some-other-route"];

  const handleDialDialogOpen = () => {
    setIsDialDialogOpen(true);
  };

  const handleCloseDialDialog = () => {
    setIsDialDialogOpen(false);
  };

  const handleConsultationTypeOpenDialog = () => {
    setIsConsultationTypeOpen(true);
  };

  const handleConsultationTypeCloseDialog = () => {
    setIsConsultationTypeOpen(false);
  };

  const handleNavigate = (label) => {
    sessionStorage.setItem("selectedLabel", label);
    router.push("/appointment");
  };

  const dialOptions = [
    { label: "Dial", action: dial, icon: 0 },
    { label: "Whatsapp", action: openSupportWhatsAppWeb, icon: 1 },
  ];

  useEffect(() => {
    const processConsultations = (data) => {
      // Filter active items and transform into consultationOptions format
      console.log(data, "56 processed consultation");
      const activeConsultations = data
        .filter((item) => item.isActive)
        .map((item) => ({
          label: item.name,
          action: () => handleNavigate(item.name),
          icon: getIconByName(item.name),
        }));

      console.log(activeConsultations, "active consultation");

      // Set options and store in sessionStorage
      setConsultationTypes(activeConsultations);
      sessionStorage.setItem(
        sessionStorageName.ConsultationFee,
        JSON.stringify(data)
      );
    };

    const storedConsultations = sessionStorage.getItem(
      sessionStorageName.ConsultationFee
    );

    const parsedConsultations = JSON.parse(storedConsultations);

    console.log(parsedConsultations, "stored consultation in header");

    if (parsedConsultations && parsedConsultations.length > 0) {
      console.log(parsedConsultations, "paresed consultation 83");
      processConsultations(parsedConsultations);
    } else {
      fetch(api.consiltationFee)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch consultations");
          }
          return response.json();
        })
        .then((data) => {
          processConsultations(data);
        })
        .catch((error) =>
          console.error("Error fetching consultations:", error)
        );
    }
  }, []);

  // Helper function to map names to icon numbers
  const getIconByName = (name) => {
    const iconMapping = {
      call: 2,
      video: 3,
      clinic: 4,
      home_visit: 5,
    };

    // Normalize the name to lowercase for case-insensitive matching
    const normalizedName = name.toLowerCase();
    return iconMapping[normalizedName] || 0; // Default to 0 if name doesn't match
  };

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
          <a
            onClick={(e) => {
              e.preventDefault();
              handleDialDialogOpen();
            }}
            className="callusbtn"
          >
            <FaWhatsapp className="mx-1" />
          </a>
        </Link>
      </div>
      {/* HEADER STRIP */}
      <div
        className="headtoppart clearfix"
        style={{ backgroundColor: "#3b5f1d" }}
      >
        <div className="headerwp clearfix">
          {/* Address */}
          <div className="headertopleft">
            <div className="address clearfix">
              <span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sector%2057%20Gurgaon%20Haryana%20122003"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <FaMapMarkedAlt className="mx-1" />
                    <b style={{ fontWeight: "bold", fontSize: 14 }}>
                      {address}
                    </b>
                  </span>
                </a>
              </span>
              <Link legacyBehavior href="/">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleDialDialogOpen();
                  }}
                  href={`tel:${contact_no}`}
                  className="callusbtn"
                  onMouseOver={(e) => {
                    e.target.style.color = "#8e8333";
                  }} // Change color on hover
                  onMouseOut={(e) => {
                    e.target.style.color = "#ffffff";
                  }}
                >
                  <FaWhatsapp className="mx-1" />
                  <b style={{ fontWeight: "bold", fontSize: 14 }}>
                    {contact_no}
                  </b>
                </a>
              </Link>
            </div>
            <PopupDialog
              isOpen={isDialDialogOpen}
              onClose={handleCloseDialDialog}
              options={dialOptions}
            />
          </div>
          {/* Social Links */}
          <div className="headertopright">
            {/* <a className="googleicon" title="Google" href="#">
              <i className="fab fa-google" />
              <span className="mobiletext02">Google</span>
            </a> */}
            <a
              className="linkedinicon"
              title="Linkedin"
              target="blank"
              href="https://www.linkedin.com/in/iatrichealthcare/"
            >
              <FaLinkedin size={25} />
              <span className="mobiletext02">Linkedin</span>
            </a>
            <a
              className="instagramicon"
              title="Instagram"
              target="blank"
              href="https://www.instagram.com/iatric.healthcare/"
            >
              <FaInstagram size={25} />
              <span className="mobiletext02">Instagram</span>
            </a>

            {/* <a className="twittericon" title="Twitter" href="#">
              <i className="fab fa-twitter" />
              <span className="mobiletext02">Twitter</span>
            </a> */}
            <a
              className="facebookicon"
              title="Facebook"
              target="blank"
              href={facebook_page_url}
            >
              <FaFacebook size={25} />
              <span className="mobiletext02">Facebook</span>
            </a>
          </div>
        </div>
      </div>
      {/* END HEADER STRIP */}
      {/* NAVIGATION MENU */}
      <div className="wsmainfull menu clearfix d-none d-lg-block">
        <div className="wsmainwp clearfix">
          {/* LOGO IMAGE */}
          {/* For Retina Ready displays take a image with double the amount of pixels that your image will be displayed (e.g 360 x 80 pixels) */}

          {/* MAIN MENU */}
          <nav className="wsmenu clearfix">
            <div
            className="desktoplogo"
              style={{ position: "absolute", left: 0 }}
            >
              <a href="#">
                <Image
                  src="/images/logo.png"
                  width={180}
                  height={60}
                  alt="header-logo"
                />
              </a>
            </div>
            <ul className="wsmenu-list h6 font-weight-bold">
              {/* DROPDOWN MENU */}
              <li aria-haspopup="true">
                <Link legacyBehavior href="/">
                  <a>
                    Home{" "}
                    <span
                    // className="wsarrow" uncomment to enable down arrow
                    />
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
                        {/* <li className="title">Standard Pages:</li> */}
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
                            <a>Contact Us</a>
                          </Link>
                        </li>
                      </ul>
                      {/* MEGAMENU LINKS */}
                      <ul className="col-lg-3 col-md-12 col-xs-12 link-list">
                        {/* <li className="title">Medical Pages:</li> */}
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
                        {/* <li className="title">Special Pages:</li> */}
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
                        {/* <li className="title">Auxiliary Pages:</li> */}
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
              {!hiddenRoutes.includes(router.pathname) && (
                <li className="nl-simple" aria-haspopup="true">
                  <button
                    className="mt-3 clickable-div"
                    style={{
                      backgroundColor: `${color_schema.green}`, // Custom background color
                      color: "#fff", // Text color
                      border: "none", // Remove border
                      padding: "10px 20px", // Padding for button
                      borderRadius: "5px", // Rounded corners
                      fontWeight: "bold", // Bold text
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleConsultationTypeOpenDialog();
                    }}
                  >
                    Book an Appointment
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* END MAIN MENU */}
        </div>
        <div>
          <PopupDialog
            isOpen={isConsultationTypeOpen}
            onClose={handleConsultationTypeCloseDialog}
            options={consultationTypes}
          />
        </div>
      </div>
      <MobileMenu />
      {/* END NAVIGATION MENU */}
    </header>
  );
};

export default Header1;
