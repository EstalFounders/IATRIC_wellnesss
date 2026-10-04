import Link from "next/link";
import React, { useState } from "react";
import { api, contact_no, email } from "../constant";
import { dial, isMobileValid, openSupportWhatsAppWeb } from "../helper";
import { useRouter } from "next/router";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import PopupDialog from "./Common/PopupDialog";
import CircleLoader from "./circleLoader";
import { ConsultationButton } from "./Common/commonUi";
import { sendUserQuery } from "./ApiService/UtilService";

const JoinUs = () => {
  const router = useRouter();
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    applying_for: "",
    message: "",
  });
  const [error, setError] = useState();

  const handleDialDialogOpen = () => {
    setIsDialDialogOpen(true);
  };
  const handleCloseDialDialog = () => {
    setIsDialDialogOpen(false);
  };

  const handleEmail = () => {
    router.push(`mailto:${email}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const dialOptions = [
    { label: "Dial", action: dial },
    { label: "Whatsapp", action: openSupportWhatsAppWeb },
  ];

  const saveQuery = async (e) => {
    setLoading(true);
    if (!isMobileValid(formData.mobile_number)) {
      setIsSuccess(false);
      setError("Please enter a valid mobile number");
      setLoading(false);
      return;
    }
    const res = await sendUserQuery(formData);
    

    if (res.ok) {
      setIsSuccess(true);
      setLoading(false);
      setError("Application submitted successfully");
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        applying_for: "",
        message: "",
      });
    } else {
      setError("Failed to submit. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <section id="join-us" className="bg-lightgrey wide-60 contacts-section division">
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <h3 className="h3-md text-dark">Join Us at Healthpath</h3>
            <h3 className="h3-md text-dark">Be a Part of Our Growing Network</h3>
            <div>
              We’re always looking to collaborate with passionate professionals and partners. 
              Whether you’re a <strong>Doctor</strong>, <strong>Lab</strong>, 
              <strong>Pharmacy</strong>, or <strong>Help Desk</strong> provider — 
              Healthpath invites you to join us in making quality healthcare accessible to all.
            </div>
          </div>
        </div>

        <div className="row">
          {/* CONTACTS INFO */}
          <div className="col-md-5 col-lg-4">
            <div className="contact-box mb-40">
              <h2 className="text-dark">Contact Us</h2>
              <hr />
              <h5>Sector 57, Gurgaon Haryana-122003</h5>
              <h5>
                <FaPhoneAlt />{" "}
                <Link legacyBehavior href="#">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                  >
                    {contact_no}
                  </a>
                </Link>
              </h5>
              <h5>
                <MdEmail size={25} />
                <Link legacyBehavior href="#">
                  <a
                    className="ml-2"
                    onClick={(e) => {
                      handleEmail();
                      e.preventDefault();
                    }}
                  >
                    {email}
                  </a>
                </Link>
              </h5>
            </div>

            <div className="contact-box mb-40">
              <h2 className="text-dark">Working Hours</h2>
              <hr />
              <h5>Monday – Sunday : 7:00 AM - 10:00 PM</h5>
            </div>
          </div>

          {/* FORM */}
          <div className="col-md-7 col-lg-8">
            <div className="form-holder mb-40">
              <form onSubmit={(e) => e.preventDefault()} className="row contact-form">
                {/* Name */}
                <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      className="form-control name"
                      placeholder="Your Name*"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <input
                      className="form-control phone"
                      type="tel"
                      name="mobile_number"
                      placeholder="Your Phone Number*"
                      required
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Applying For */}
                <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <select
                      name="applying_for"
                      className="form-control"
                      required
                      value={formData.applying_for}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Applying For*</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Lab">Lab</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Help Desk">Help Desk</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="col-md-12 input-message">
                  <div className="form-group">
                    <textarea
                      className="form-control message"
                      name="message"
                      rows={8}
                      placeholder="Your Message ..."
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="col-md-12 mt-15 form-btn d-flex d-inline-flex">
                  <ConsultationButton onClick={saveQuery}>
                    Apply Now
                  </ConsultationButton>
                  {loading && (
                    <div className="mt-3 ml-5">
                      <CircleLoader />
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <PopupDialog
          isOpen={isDialDialogOpen}
          onClose={handleCloseDialDialog}
          options={dialOptions}
        />
      </div>

      <div
        className={`text-center ${
          isSuccess ? "text-success" : "text-danger"
        } font-weight-bold`}
      >
        {error}
      </div>
    </section>
  );
};

export default JoinUs;
