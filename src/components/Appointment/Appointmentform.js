import React, { useState } from "react";
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
import { CHOOSE_TIME, IS_NOW, price_symbol } from "../../constant";
import { formatTime } from "../helper";

const toLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const AppointmentForm = ({
  appointmentState,
  setter,
  handleCloseSnackBar,
  sendWhatsAppConfirmation,
  handleTimeSelection,
  handleSlotSelection,
  handleConsultationChange,
}) => {
  const [descriptionOptions] = useState([]);

  const handleDescriptionChange = (e) => {
    setter.setSymptoms(e.target.value);
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split("-");
    setter.setSelectedDate(new Date(year, month - 1, day));
  };

  const today = toLocalDateString(new Date());
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 5);
  const maxDateStr = toLocalDateString(maxDate);

  const selectedDateStr =
    appointmentState.selectedDate instanceof Date
      ? toLocalDateString(appointmentState.selectedDate)
      : today;

  const consultationOptions = (appointmentState.consultationOptions || []);

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

          {/* Symptoms */}
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
            />
          </div>

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

          {/* Consultation Type - Dynamically from Services */}
          <Typography variant="h6" mt={3} className="text-center">
            Consultation Type
          </Typography>
          <RadioGroup
            row
            value={appointmentState.consultationType}
            onChange={(e) => {
              handleConsultationChange(e);
              const selectedOption = appointmentState.consultationOptions.find(
                (opt) => opt.name === e.target.value
              );
              if (selectedOption && setter.setConsultationPrice) {
                setter.setConsultationPrice(selectedOption.fee || "");
              }
            }}
            style={{ justifyContent: "center", marginBottom: "20px" }}
          >
            {consultationOptions.map((option) => (
              <Box
                key={option.name}
                display="flex"
                flexDirection="column"
                alignItems="center"
                mx={1}
              >
                <FormControlLabel
                  value={option.name}
                  control={<Radio />}
                  label={option.name}
                />
                {appointmentState.consultationType === option.name && option.fee && (
                  <Typography
                    variant="body2"
                    className={styles.priceText}
                    // style={{ marginTop: 4 }}
                  >
                    {price_symbol} {option.fee}
                  </Typography>
                )}
              </Box>
            ))}
          </RadioGroup>

          {/* When */}
          <Typography variant="h6" mt={2} className="text-center">
            When?
          </Typography>
          <RadioGroup
            row
            value={appointmentState.timeSelection}
            onChange={handleTimeSelection}
            style={{ justifyContent: "center", marginBottom: "12px" }}
          >
            <FormControlLabel value={IS_NOW} control={<Radio />} label="Now" />
            <FormControlLabel
              value={CHOOSE_TIME}
              control={<Radio />}
              label="Choose Time"
            />
          </RadioGroup>

          {/* Date + slot picker */}
          {appointmentState.timeSelection === CHOOSE_TIME && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              mb={2}
            >
              <input
                type="date"
                className={styles.input}
                style={{ width: "50%" }}
                min={today}
                max={maxDateStr}
                value={selectedDateStr}
                onChange={handleDateChange}
              />

              {(() => {
                const now = new Date();
                const futureSlots = (appointmentState.locallyCreatedSlots || []).filter(
                  (slot) => new Date(slot.startTime) > now
                );
                return futureSlots.length > 0 ? (
                  <select
                    className={styles.input}
                    style={{ width: "50%" }}
                    value={appointmentState.selectedSlot?._id || ""}
                    onChange={(e) => {
                      const slot = futureSlots.find(
                        (s) => s._id === e.target.value
                      );
                      if (slot) handleSlotSelection(slot);
                    }}
                  >
                    <option value="" disabled>
                      Select a time slot
                    </option>
                    {futureSlots.map((slot) => (
                      <option key={slot._id} value={slot._id}>
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No slots available for the selected date.
                  </Typography>
                );
              })()}
            </Box>
          )}

          {/* Snackbar */}
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

          {/* Submit */}
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