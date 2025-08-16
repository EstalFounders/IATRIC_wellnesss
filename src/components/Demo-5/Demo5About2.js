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
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState();
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
        <div className="abox-2-holder py-5">
          <div className="text-center mb-5">
            <h1 className="steelblue-color">Welcome to Healthpath</h1>
            <div className="h5 mx-auto w-75">
              At Healthpath, we are committed to providing expert medical
              consultations and quality healthcare. <br /> We offer seamless
              appointment booking, experienced doctors, and reliable patient
              care every day.
            </div>
            <p className="mt-3 h3">
              Opening Hours:{" "}
              <strong>Monday – Sunday | 9:00 AM - 8:00 PM</strong>
            </p>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-center flex-wrap gap-3">
              <div>
                <ConsultationButton onClick={handleConsultationTypeOpenDialog}>
                  Find a Doctor
                </ConsultationButton>
              </div>
              <div className="ml-3">
                <ConsultationButton onClick={handleOpenCalltoBookDialog}>
                  <FaPhoneAlt className="mr-2" />
                  {callToBook}
                </ConsultationButton>
              </div>
              <hr className="w-75" />
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="h-100 p-4 text-center shadow-sm border rounded">
                    <h5 className="steelblue-color mb-3">Our Doctors</h5>
                    <p>
                      Browse through our panel of experienced and certified
                      doctors, available for online and offline consultations.
                    </p>
                    <ConsultationButton path="/doctors">
                      View Doctors
                    </ConsultationButton>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="h-100 p-4 text-center shadow-sm border rounded">
                    <h5 className="steelblue-color mb-3">Need Help?</h5>
                    <p>
                      For appointment booking, support or any questions, feel
                      free to contact us directly.
                    </p>
                    <ConsultationButton path="/doctors">
                      <FaPhoneAlt className="mr-2" />
                      Contact Support
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
