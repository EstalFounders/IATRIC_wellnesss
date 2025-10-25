import React, { useState, useCallback, useEffect } from "react";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { ConsultationButton } from "../Common/commonUi";
import styles from "./css/appointmentPage.module.css";
import { fetchServiceSuggestions } from "../ApiService/UtilService";

const AppointmentForm = ({
  appointmentState,
  setter,
  handleCloseSnackBar,
  sendWhatsAppConfirmation,
}) => {
  const [descriptionOptions, setDescriptionOptions] = useState([]);

  const description = appointmentState.symptoms;

  // useEffect(() => {
  //   // This effect will run whenever the 'description' state changes.
  //   // The utility function already contains the check for an empty string.
  //   fetchServiceSuggestions(description, setDescriptionOptions);

  //   // This cleanup function is crucial to cancel any pending API calls
  //   // when the component unmounts or before the next effect runs.
  //   return () => {
  //     fetchServiceSuggestions.cancel();
  //   };
  // }, [description]); // The effect's dependency array

  // Trigger fetch on blur or stop typing
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setter.setSymptoms(value);
    // fetchSuggestions(value);
  };

  return (
    <div className="col-lg-8">
      <div className="txt-block pr-30">
        <Typography variant="h4" className={styles.makeAppointmentText}>
          Make Appointment
        </Typography>

        <form onSubmit={(e) => e.preventDefault()} className="appointment-form">
          {/* Name */}
          <div style={{ display: "flex", justifyContent: "center" }}>
          
          <TextField
          className="w-50"
            label="Name"
            variant="outlined"
            margin="normal"
            value={appointmentState.name}
            onChange={(e) => setter.setName(e.target.value)}
          />
          </div>

          {/* Description */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              className="w-50"
              multiline
              rows={1}
              label="Describe your symptoms..."
              variant="outlined"
              margin="normal"
              value={appointmentState.symptoms}
              onChange={handleDescriptionChange}
              // onBlur={() => fetchSuggestions(appointmentState.symptoms)}
            />
          </div>

          {/* Dynamically generated radio buttons from description API */}
          {descriptionOptions.length > 0 && (
            <>
              <Typography variant="subtitle1" mt={2}>
                Select Closest Match:
              </Typography>
              <RadioGroup
                value={appointmentState.selectedSymptom || ""}
                onChange={(e) => setter.setSelectedSymptom?.(e.target.value)}
              >
                {descriptionOptions.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </>
          )}

          {/* Mobile Number */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              className="w-50"
              label="Mobile Number"
              variant="outlined"
              type="tel"
              margin="normal"
              inputProps={{ minLength: 10, maxLength: 10 }}
              value={appointmentState.mobNo}
              onChange={(e) => setter.setMobNo(e.target.value)}
            />
          </div>

          {/* Consultation Type */}
          <Typography variant="h6" mt={3} className="text-center">
            Consultation Type
          </Typography>
          <RadioGroup
            row
            value={appointmentState.consultationType}
            onChange={(e) => setter.setConsultationType(e.target.value)}
            style={{ justifyContent: "center", marginBottom: "20px" }}
          >
            <FormControlLabel value="Call" control={<Radio />} label="Call" />
            <FormControlLabel value="Video" control={<Radio />} label="Video" />
          </RadioGroup>

          {/* Snackbar for messages */}
          <Snackbar
            open={appointmentState.openSnackBar}
            autoHideDuration={6000}
            onClose={handleCloseSnackBar}
          >
            <Alert
              onClose={handleCloseSnackBar}
              severity={appointmentState.severity}
              sx={{ width: "100%" }}
            >
              {appointmentState.snackBarMessage}
            </Alert>
          </Snackbar>

          {/* Submit button */}
          <Box mt={4} mb={4} display="flex" justifyContent="center">
            <ConsultationButton onClick={sendWhatsAppConfirmation}>
              {appointmentState.isLoading ? "Loading..." : "Consult"}
            </ConsultationButton>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
