import Link from "next/link";
import React, { useState } from "react";
import PopupDialog from "./PopupDialog";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import { Button } from "react-bootstrap";
import { contact_no } from "../../constant";

const Services7 = () => {
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
                          Top Level Doctors
                        </h5>
                        <p className="p-sm">
                          Access <b>India&apos;s leading medical experts</b> from
                          anywhere. Our highly qualified and experienced doctors
                          provide
                          <b> exceptional, personalized care.</b> Trust
                          Healthpath for
                          <b> top-tier medical consultations</b> and your best
                          health outcomes. Experience healthcare delivered by
                          the best.
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
                          Modern Equipment
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          At Healthpath, your health is supported by the{" "}
                          <b>latest medical technology.</b> We utilize{" "}
                          <b>state-of-the-art equipment</b> for precise
                          diagnostics and effective treatments. This commitment
                          ensures <b>accurate results and superior care,</b>{" "}
                          empowering your journey to wellness.
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
                          Qualified Facilities
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          Healthpath connects you with{" "}
                          <b>top-tier medical facilities</b> across India. We
                          ensure access to{" "}
                          <b>modern infrastructure and advanced technology.</b>{" "}
                          Experience
                          <b>safe, comfortable environments</b> for all your
                          treatment needs. Trust Healthpath for{" "}
                          <b>high-quality, accessible care.</b>
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
                          Professional Services
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          Experience expert medical care tailored to your needs.
                          <b>Our highly qualified doctors and nurses</b> provide
                          comprehensive support,{" "}
                          <b>ensuring your well-being.</b> Trust Healthpath for
                          reliable, high-quality healthcare
                          <b>services across India.</b>
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
                          Medical Counseling
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          <b>
                            Immediate medical assistance is just a call away.
                          </b>
                          Healthpath provides rapid, reliable emergency support
                          for urgent medical needs. Our expert team ensures
                          prompt attention and care, wherever you are. Trust
                          Healthpath for swift and efficient emergency
                          healthcare when it matters most.
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
                          Emergency Help
                        </h5>
                        {/* Text */}
                        <p className="p-sm">
                          <b>
                            Immediate medical assistance is just a call away.
                          </b>
                          Healthpath provides rapid, reliable emergency support
                          for urgent medical needs. Our expert team ensures
                          prompt attention and care, wherever you are. Trust
                          Healthpath for swift and efficient emergency
                          healthcare when it matters most.
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
                Healthpath: Your Convenient Path to healthier life , Open Daily
              </h4>
              {/* Text */}
              <p className="p-md">
                Don&apos;t let a busy schedule or long distances prevent you from
                receiving the medical attention you deserve. At Healthpath, we
                make prioritizing your health simple and accessible. Our doors
                are open seven days a week, from 8:00 AM to 8:00 PM (Monday –
                Sunday), ensuring you can access expert medical care when it&apos;s
                most convenient for you. Contact Healthpath today and experience
                a clinic with a truly innovative approach to treatment, designed
                around your life. Start your journey to a healthier you with us!
              </p>
              {/* Table */}
              <table className="table">
                <tbody>
                  <tr>
                    <td>Mon – Fri</td>
                    <td> - </td>
                    <td className="text-right">8:00 AM - 8:00 PM</td>
                  </tr>
                  <tr>
                    <td>Saturday</td>
                    <td>-</td>
                    <td className="text-right">8:00 AM - 8:00 PM</td>
                  </tr>
                  <tr>
                    <td>Sunday</td>
                    <td>-</td>
                    <td className="text-right">8:00 AM - 8:00 PM</td>
                  </tr>
                </tbody>
              </table>
              {/* Title */}
              {/* <h5 className="h5-sm">Need a personal health plan?</h5> */}
              {/* Text */}
              <p className="h5 box-list">
                Contact Healthpath today and experience a clinic with a truly
                innovative approach to treatment.
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
                  Call/WhatsApp -{" "}
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
