import Link from "next/link";
import React, { useState } from "react";
import { contact_no } from "../../constant";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import PopupDialog from "../Common/PopupDialog";
import { FaPhoneAlt } from "react-icons/fa";

const Demo5About2 = () => {
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
    <section id="about-2" className="about-section division">
      <div className="container">
        {/* Content Boxes */}
        <div className="abox-2-holder">
          <div className="text-center mb-4 mt-4">
            {/* Heading */}
            <h1 className="steelblue-color">Welcome to Healthpath</h1>
            <p className="h5 box-list grey-color mx-5 w-50 mr-auto  ml-auto">
              At Healthpath, we are dedicated to providing exceptional
              healthcare services. Explore our working hours, doctor&apos;s
              timetable and ways to get in touch with us.
            </p>
          </div>
          <hr className="w-75" />
          <div className="row mx-4">
            {/* ABOUT BOX #1 */}
            <div className="col-md-4">
              <div className="abox-2 h-100 d-flex flex-column justify-content-center align-items-center">
                {/* Title */}
                <h5 className="h5-md steelblue-color">Opening Hours</h5>
                {/* Table */}
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Mon – Sun</td>
                      <td> - </td>
                      <td className="text-right">9:00 AM - 8:00 PM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* ABOUT BOX #2 */}
            <div className="col-md-4">
              <div className="abox-2 h-100 d-flex flex-column justify-content-center align-items-center">
                <h5 className="h5-md steelblue-color">Doctors Timetable</h5>
                {/* Text */}

                {/* Button */}
                <Link legacyBehavior href="/timetable">
                  <a
                    className="btn btn-sm btn-blue blue-hover mt-2"
                    style={{ backgroundColor: "#3b5f1d" }}
                  >
                    View Timetable
                  </a>
                </Link>
              </div>
            </div>
            {/* ABOUT BOX #3 */}
            <div className="col-md-4">
              <div className="abox-2 h-100 d-flex flex-column justify-content-center align-items-center">
                {/* Title */}
                <h5 className="h5-md steelblue-color">Get in Touch</h5>
                {/* Text */}
                <h4 className="h4-sm emergency-call blue-color d-flex align-items-center">
                  <FaPhoneAlt className="mr-2" />
                  <a
                    style={{ color: "#8e8333" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#3b5f1d";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#8e8333";
                    }}
                  >
                    {contact_no}
                  </a>
                </h4>
              </div>
            </div>
          </div>
          {/* End row */}
          <PopupDialog
            isOpen={isDialDialogOpen}
            onClose={handleCloseDialDialog}
            options={dialOptions}
          />
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5About2;
