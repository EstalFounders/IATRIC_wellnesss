import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { ConsultationButton } from "./commonUi";
import { color_schema } from "../../constant";
import { isMobileValid } from "../../helper";

const CalltoBookPopup = ({ show, onClose, onSubmit, onOtpRequired }) => {
  const [mobNo, setMobNo] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = () => {
    if (!mobNo.trim()) {
      setResponse("Please enter a mobile number");
      return;
    }
    if (!isMobileValid(mobNo)) {
      setResponse("Please enter a valid 10-digit mobile number");
      return;
    }
    setResponse("");
    onOtpRequired(mobNo);
  };

  return (
    <Dialog
      open={show}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          margin: "auto",
        },
      }}
      BackdropProps={{
        style: { backgroundColor: "rgba(0,0,0,0.5)" },
      }}
      sx={{
        "& .MuiDialog-container": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        className="bg-green-gradient text-center text-white relative"
        style={{ position: "relative", paddingRight: "3rem" }}
      >
        <b>Connect with HealthPath team</b>
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent style={{ padding: "1.5rem" }}>
        <p
          className="text-muted text-center mb-4"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          Enter your mobile number, and our team will call you back shortly.
        </p>

        <input
          type="tel"
          className="form-control form-control-lg rounded-pill px-4"
          style={{
            border: `2px solid ${color_schema.green}`,
            transition: "all 0.3s ease",
          }}
          placeholder="Enter your 10 digit mobile number"
          value={mobNo}
          onChange={(e) => setMobNo(e.target.value)}
        />

        {response && (
          <div className="text-danger text-center mt-3">{response}</div>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        style={{
          justifyContent: "center",
          paddingBottom: "1.5rem",
          gap: "1rem",
        }}
      >
        <ConsultationButton
          style={{
            backgroundColor: color_schema.green,
            color: "white",
            borderRadius: "25px",
          }}
          onClick={handleSubmit}
        >
          Book a call back
        </ConsultationButton>
      </DialogActions>
    </Dialog>
  );
};

export default CalltoBookPopup;
