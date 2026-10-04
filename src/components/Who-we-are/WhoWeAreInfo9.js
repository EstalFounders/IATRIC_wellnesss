import React, { useState } from "react";
import PopupDialog from "../Common/PopupDialog";
import { contact_no } from "../../constant";
import { dial,openSupportWhatsAppWeb } from "../../helper";
import { Button } from "react-bootstrap";

const WhoWeAreInfo9 = () => {
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
    <section id="info-9" className="bg-blue info-section division">
      {/* TEXT BLOCK */}
        <div className="row">
          <div className="col-lg-6">
            {/* TEXT BLOCK */}
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
                are open seven days a week, from 7:00 AM to 10:00 PM (Monday –
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
                    <td className="text-right">7:00 AM - 10:00 PM</td>
                  </tr>
                  <tr>
                    <td>Saturday</td>
                    <td>-</td>
                    <td className="text-right">7:00 AM - 10:00 PM</td>
                  </tr>
                  <tr>
                    <td>Sunday</td>
                    <td>-</td>
                    <td className="text-right">7:00 AM - 10:00 PM</td>
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
        </div>
        {/* End row */}
      {/* END TEXT BLOCK */}
      {/* INFO-9 IMAGE */}
      <div className="info-9-img bg-fixed text-center" />
    </section>
  );
};

export default WhoWeAreInfo9;
