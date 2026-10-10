import Link from "next/link";
import React, { useState } from "react";
import { api, callToBook, contact_no, color_schema } from "../../constant";
import { dial, openSupportWhatsAppWeb } from "../../helper";
import PopupDialog from "../Common/PopupDialog";
import { FaPhoneAlt } from "react-icons/fa";
import { ConsultationButton } from "../Common/commonUi";
import CalltoBookPopup from "../Common/CalltoBookPopup";
import { useSelector } from "react-redux";
import { Alert, Snackbar } from "@mui/material";
import WhatsappConfirmationModel from "../Appointment/modal/WhatsappConfirmationModel";
import OtpConfirmationPopup from "../Appointment/OtpConfirmationPopup";
import { useLanguage } from "../../i18n/LanguageContext";

const Demo5About2 = () => {
  const [isCalltoBookDialog, setIsCalltoBookDialog] = useState(false);
  const [isConsultationTypeOpen, setIsConsultationTypeOpen] = useState(false);
  const [response, setResponse] = useState();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [otpConfirmationPopup, setOtpConfirmationPopup] = useState(false);
  const [otpMobNo, setOtpMobNo] = useState("");
  const { t } = useLanguage();

  const handleCalltoBookPopupSubmit = async (mobNo) => {
    setIsCalltoBookDialog(false);
    try {
      const res = await fetch(api.userQuery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: Number(mobNo) }),
      });
      if (!res.ok) throw new Error("Request failed");
      setResponse(t("demo5.about.queryOk"));
      setSeverity("success");
    } catch {
      setResponse(t("common.errorTryAgain"));
      setSeverity("error");
    }
    setOpenSnackBar(true);
  };

const consultationTypes = useSelector(
  (state) => state.otherConfigSlice?.activeConsultation
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

  const handleOtpRequired = (mobNo) => {
    setOtpMobNo(mobNo);
    setIsCalltoBookDialog(false);
    setOtpConfirmationPopup(true);
  };

  const handleOtpConfirm = () => {
    setOtpConfirmationPopup(false);
    handleCalltoBookPopupSubmit(otpMobNo);
  };

  return (
    <div>
      <section id="about-2" className="about-section division">
        <div className="container">
          {/* Content Boxes */}
          <div className="abox-2-holder py-2">
            <div className="text-center mb-5">
              <h1 className="steelblue-color">{t("demo5.about.welcome")}</h1>
              <div
                className="h5 mx-auto steelblue-color w-100"
                style={{ color: "#010101" }}
              >
                {t("demo5.about.intro1")}{" "}
                <br /> {t("demo5.about.intro2")}
                <br />
                <div
                  className="font-weight-bold h4 mt-2"
                  style={{ color: color_schema.gold }}
                >
                  {t("demo5.about.bookOnline")}
                </div>
              </div>
              <p className="mt-3 h3">
                <strong>{t("demo5.about.hours")}</strong>
              </p>

              {/* Buttons */}
              <div className="mt-4 d-flex justify-content-center flex-wrap gap-3">
                <div>
                  <ConsultationButton
                    variant="book-now"
                    onClick={handleConsultationTypeOpenDialog}
                  >
                    <div className="">{t("common.bookNow")}</div>
                  </ConsultationButton>
                </div>
                <div className="ml-3">
                  <ConsultationButton onClick={handleOpenCalltoBookDialog}>
                    {/* <FaPhoneAlt className="mr-2" /> */}
                    {t("common.getCallback")}
                  </ConsultationButton>
                </div>
                <PopupDialog
                  isOpen={isConsultationTypeOpen}
                  onClose={handleConsultationTypeCloseDialog}
                  options={consultationTypes}
                />
                <CalltoBookPopup
                  show={isCalltoBookDialog}
                  onClose={handleCloseCalltoBookDialog}
                  onSubmit={handleCalltoBookPopupSubmit}
                  onOtpRequired={handleOtpRequired}
                />
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
      </section>
      {/* End container */}
      <WhatsappConfirmationModel
        isOpen={otpConfirmationPopup}
        onClose={() => setOtpConfirmationPopup(false)}
      >
        <OtpConfirmationPopup mobile={otpMobNo} onConfirm={handleOtpConfirm} />
      </WhatsappConfirmationModel>
    </div>
  );
};

export default Demo5About2;
