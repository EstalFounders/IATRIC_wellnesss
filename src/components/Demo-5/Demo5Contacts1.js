import Link from "next/link";
import React, { useState } from "react";
import { api, contact_no, email } from "../../constant";
import PopupDialog from "../Common/PopupDialog";
import { dial, isMobileValid, openSupportWhatsAppWeb } from "../../helper";
import { useRouter } from "next/router";
import CircleLoader from "../circleLoader";

const Demo5Contacts1 = () => {
  const router = useRouter();
  const [isDialDialogOpen, setIsDialDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    patient: "",
    visited_before: "",
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
    console.log(name, value, "name value");
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
      return;
    }

    console.log(formData, "form data of query");
    const res = await fetch(api.userQuery, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsSuccess(true);
      setLoading(false);
      setError("Query saved successfully");
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        patient: "",
        visited_before: "",
        message: "",
      });
    } else {
      setError("Failed to save query. Please try again later.");
    }
  };

  return (
    <section
      id="contacts-1"
      className="bg-lightgrey wide-60 contacts-section division"
    >
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            {/* Title 	*/}
            <h3 className="h3-md text-dark">
              Need Help? We&apos;re Here to Talk
              
            </h3>
            <h3 className="h3-md text-dark">
              Contact Healthpath Today
            </h3>
            {/* Text */}
            <div>

              Feeling unsure about your health or in need of expert guidance? At Healthpath, we&apos;re always here to listen and provide the support you need. Don&apos;t hesitate to <strong>reach out with any questions, concerns, or simply to discuss your healthcare goals</strong>.
            </div>
            <div>
              We&apos;re dedicated to offering <strong>personalized support</strong> and helping you confidently navigate your wellness journey. Whether you need an <strong>online consultation</strong>, have a question about our telemedicine services, or want to learn more about <strong>accessing expert medical care</strong> from home, our team is ready to assist. <strong>Contact Healthpath today</strong> and let us be your partner in health.

              Feeling unsure or in need of guidance? At Healthpath, we&apos;re
              here to listen. Don&apos;t hesitate to reach out with any
              questions, concerns, or simply to discuss your healthcare goals.
              We&apos;re dedicated to providing personalized support and helping
              you navigate your wellness journey.

            </div>
          </div>
        </div>
        <div className="row">
          {/* CONTACTS INFO */}
          <div className="col-md-5 col-lg-4">
            {/* General Information */}
            <div className="contact-box mb-40">
              <h2>Contact Us</h2><hr />
              <h5>Sector 57, Gurgaon Haryana-122003</h5>
              <h5>
                Ph:{" "}
                <Link legacyBehavior href="#">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleDialDialogOpen();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#3b5f1d";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#000000";
                    }}
                  >
                    {contact_no}
                  </a>
                </Link>
              </h5>
              <h5>
                Email:
                <Link legacyBehavior href="#">
                  <a
                    className="ml-2"
                    onClick={(e) => {
                      handleEmail();
                      e.preventDefault();
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#3b5f1d";
                    }} // Change color on hover
                    onMouseOut={(e) => {
                      e.target.style.color = "#000000";
                    }}
                  >
                    {email}
                  </a>
                </Link>
              </h5>
            </div>
            {/* Working Hours */}
            <div className="contact-box mb-40">
              <h2>Working Hours</h2><hr />
              <h5>Monday – Sunday : 8:00 AM - 8:00 PM</h5>
            </div>
          </div>
          {/* END CONTACTS INFO */}
          {/* CONTACT FORM */}
          <div className="col-md-7 col-lg-8">
            <div className="form-holder mb-40">
              <form
                onSubmit={(e) => e.preventDefault()}
                name="contactForm"
                id="contact-form"
                className="row contact-form"
                method="post"
              >
                {/* Name */}
                <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <input
                      id="form_name"
                      type="text"
                      name="name"
                      className="form-control name"
                      placeholder="Your Name*"
                      required="required"
                      value={formData.name}
                      onChange={handleInputChange}
                      data-error="Enter no more than (2) characters."
                    />
                    <div className="help-block with-errors" />
                  </div>
                </div>
                {/* Email */}
                {/* Phone */}
                <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <input
                      id="form_phone"
                      className="form-control phone"
                      type="tel"
                      name="mobile_number"
                      placeholder="Your Phone Number"
                      required="required"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      data-error="Please enter only digits."
                    />
                    <div className="help-block with-errors" />
                  </div>
                </div>
                {/* Select Input */}
                {/* <div className="col-md-12 col-lg-6">
                  <div className="form-group">
                    <select
                      id="inlineFormCustomSelect1"
                      name="visited_before"
                      className="custom-select patient"
                      required="required"
                      data-error="Select an option."
                      value={formData.visited_before}
                      onChange={handleInputChange}
                    >
                      <option>Have You Visited Us Before?*</option>
                      <option>New Patient</option>
                      <option>Returning Patient</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div> */}

                {/* Message */}
                <div className="col-md-12 input-message">
                  <div className="form-group">
                    <textarea
                      id="form-message"
                      className="form-control message"
                      name="message"
                      rows={8}
                      placeholder="Your Message ..."
                      required="required"
                      data-error="Enter no more than (10) characters."
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                    <div className="help-block with-errors" />
                  </div>
                </div>
                {/* Contact Form Message */}
                <div className="messages" />
                {/* Button */}
                <div className="col-md-12 mt-15 form-btn d-flex d-inline-flex">
                  <button
                    type="submit"
                    className="btn btn-md btn-blue blue-hover submit"
                    onClick={saveQuery}
                    style={{ backgroundColor: "#3b5f1d" }}
                  >
                    Talk to Us
                  </button>
                  {loading ? (
                    <div className="mt-3 ml-5">
                      <CircleLoader />
                    </div>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
          {/* END CONTACT FORM */}
        </div>
        {/* End row */}
        <PopupDialog
          isOpen={isDialDialogOpen}
          onClose={handleCloseDialDialog}
          options={dialOptions}
        />
      </div>
      <div
        className={`text-center ${isSuccess ? "text-success" : "text-danger"
          } font-weight-bold`}
      >
        {error}
      </div>

      {/* End container */}
    </section>
  );
};

export default Demo5Contacts1;
