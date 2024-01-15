import Link from "next/dist/client/link";
import React from "react";
import MobileMenu from "../MobileMenu";
import { Col, Row } from "react-bootstrap";

const DocLoginHeader = ({ toggleMenu }) => {
  return (
    <header id="header-2" className="header">
      {/* HEADER WIDGETS */}
      <div className="hero-widget clearfix">
        <div className="container">
          <div className="row d-flex align-items-center">
            {/* LOGO IMAGE */}
            {/* For Retina Ready displays take a image with double the amount of pixels that your image will be displayed (e.g 360 x 80 pixels) */}
            <div className="col-md-5 col-xl-6">
              <div className="desktoplogo">
                <b><strong><h2>IATRC Wellness</h2></strong></b>
              </div>
            </div>
            {/* WIDGETS */}
            <div className="col-md-7 col-xl-6">
              <div className="row">
                {/* Emergency Cases Widget 
						    		<div class="col-md-6">
						    			<div class="header-widget icon-xs">
						    				<span class="flaticon-039-emergency-call-1 blue-color"></span>
							    			<div class="header-widget-txt">
								    			<p>Emergency Cases</p> 
												<p class="header-widget-phone steelblue-color">1-800-123-4560</p>
											</div>
						    			</div>
						    		</div>*/}
                {/* Working Hours Widget */}
                <div className="col-md-6">
                  <div className="header-widget icon-xs">
                    <span className="flaticon-092-clock blue-color" />
                    <div className="header-widget-txt">
                      <p className="txt-400">Mon – Fri : - 8:00 AM - 8:00 PM</p>
                      <p className="lightgrey-color">Sat - Sun : - Closed</p>
                    </div>
                  </div>
                </div>
                {/* Location Widget */}
                <div className="col-md-6">
                  <div className="header-widget icon-xs">
                    <span className="flaticon-021-hospital-9 blue-color" />
                    <div className="header-widget-txt">
                      <p className="txt-400">121 King Street, Melbourne,</p>
                      <p className="lightgrey-color">Victoria 3000 Australia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* END WIDGETS */}
          </div>
        </div>
      </div>
      {/* END HEADER WIDGETS */}
      {/* NAVIGATION MENU */}

      {/* <MobileMenu /> */}
      {/* END NAVIGATION MENU */}
    </header>
  );
};

export default DocLoginHeader;
