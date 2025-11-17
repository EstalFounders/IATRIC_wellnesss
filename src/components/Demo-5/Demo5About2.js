import Link from "next/link";
import React, { useState } from "react";
import { callToBook, contact_no } from "../../constant";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import PopupDialog from "../Common/PopupDialog";
import { FaPhoneAlt } from "react-icons/fa";
import { ConsultationButton } from "../Common/commonUi";
import CalltoBookPopup from "../Common/CalltoBookPopup";
import { useSelector } from "react-redux";
import WhatsappConfirmationModel from "../Appointment/modal/WhatsappConfirmationModel";
import OtpConfirmationPopup from "../Appointment/OtpConfirmationPopup";
import { Alert, Snackbar } from "@mui/material";

const Demo5About2 = () => {
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState(false);
  const [isConsultationTypeOpen, setIsConsultationTypeOpen] = useState(false);
  const [mobNo, setMobNo] = useState("");
  const [otpConfirmationPopup, setOtpConfirmationPopup] = useState(false);
  const [response, setResponse] = useState();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [severity, setSeverity] = useState("success");

  const whatsappConfrimation = () => {
    setOtpConfirmationPopup(false);
    console.log("OTP confirmed, proceeding with booking");
    setResponse("We have recieved your query, Will get back to you soon");
  };

  const handleCalltoBookPopupSubmit = (mobNo) => {
    setMobNo(mobNo);
    setOtpConfirmationPopup(true);
  };

  const consultationTypes = useSelector(
    (state) => state.otherConfigSlice.activeConsultation
  );

  const handleConsultationTypeOpenDialog = () => {
    setIsConsultationTypeOpen(true);
  };

  const handleConsultationTypeCloseDialog = () => {
    setIsConsultationTypeOpen(false);
  };

  const handleOpenCalltoBookDialog = () => {
    setIsCalltoBookDialog(true);
  };
  const handleCloseCalltoBookDialog = () => {
    setIsCalltoBookDialog(false);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  return (
    <section id="about-2" className="about-section division">
      <div className="container">
        {/* Content Boxes */}
        <div className="abox-2-holder py-2">
          <div className="text-center mb-5">
            <h1 className="steelblue-color">Welcome to Healthpath</h1>
            <div className="h5 mx-auto steelblue-color w-100">
              At Healthpath, we are committed to provide expert medical care.{" "}
              <br /> We offer all time seamless doctor consultation, nursing
              care, home care, lab test diagnostics and coporate healthcare
              <br />
              <div
                className="font-weight-bold h4 mt-2"
                style={{ color: "#3b5f1d" }}
              >
                Book Online With Our Experienced Team
              </div>
            </div>
            <p className="mt-3 h3">
              <strong>Monday – Sunday | 8:00 AM - 8:00 PM</strong>
            </p>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-center flex-wrap gap-3">
              <div>
                <ConsultationButton onClick={handleConsultationTypeOpenDialog}>
                  <div className="">Book Now</div>
                </ConsultationButton>
              </div>
              <div className="ml-3">
                <ConsultationButton onClick={handleOpenCalltoBookDialog}>
                  {/* <FaPhoneAlt className="mr-2" /> */}
                  {callToBook}
                </ConsultationButton>
              </div>
              <hr className="w-75" />
              <div className="row d-flex justify-content-center align-items-center">
                <div className="col-md-8 mb-4">
                  <div className="h-100 p-4 text-center">
                    <h2 className="steelblue-color mb-3">Our Doctors Panel</h2>
                    <div className="h5 steelblue-color mx-auto w-100 pb-10">
                      Browse through our panel of experienced and certified
                      doctors. Available for online and offline consultations
                      across India.
                    </div>
                    <ConsultationButton path="/doctors">
                      View Doctors
                    </ConsultationButton>
                  </div>
                </div>
              </div>
              {/* End row */}
              <PopupDialog
                isOpen={isConsultationTypeOpen}
                onClose={handleConsultationTypeCloseDialog}
                options={consultationTypes}
              />
              <CalltoBookPopup
                show={isCalltoBookDialog}
                onClose={handleCloseCalltoBookDialog}
                onSubmit={handleCalltoBookPopupSubmit}
              />

              <WhatsappConfirmationModel
                isOpen={otpConfirmationPopup}
                onClose={() => setOtpConfirmationPopup(false)}
              >
                <OtpConfirmationPopup
                  mobile={mobNo}
                  onConfirm={whatsappConfrimation}
                />
              </WhatsappConfirmationModel>
            </div>
            <Snackbar
              open={openSnackBar}
              autoHideDuration={6000}
              onClose={handleCloseSnackBar}
            >
              <Alert
                onClose={handleCloseSnackBar}
                severity={severity}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {response}
              </Alert>
            </Snackbar>
          </div>
          {/* End abox-2-holder */}
        </div>
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5About2;
