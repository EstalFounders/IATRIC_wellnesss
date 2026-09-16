import React, { useState } from "react";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import { ConsultationButton } from "../Common/commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import styles from "./css/appointmentPage.module.css";
import { CHOOSE_TIME, IS_NOW, price_symbol } from "../../constant";
import { formatTime } from "../helper";

// Common complaints offered as quick-select radio options on the form.
const COMMON_DISEASES = [
  "Fever",
  "Cough & Cold",
  "Headache",
  "Stomach Ache / Digestion Issue",
  "Skin Problem / Rashes",
  "Body Pain / Weakness",
];

// Value used for the "Other" radio option (reveals the free-text description box).
const SYMPTOM_OTHER = "__other__";

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
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const { t } = useLanguage();

  const handleDescriptionChange = (e) => {
    setter.setSymptoms(e.target.value);
  };

  const handleSymptomSelection = (e) => {
    const value = e.target.value;
    setSelectedSymptom(value);
    if (value === SYMPTOM_OTHER) {
      // "Other" selected - clear saved symptom until the patient types one.
      setter.setSymptoms("");
    } else {
      // A common disease was selected - store it as the appointment symptom.
      setter.setSymptoms(value);
    }
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
          {t("af.title")}
        </Typography>

        <form onSubmit={(e) => e.preventDefault()} className="appointment-form">
          {/* Name */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              className="w-50"
              label={t("af.name")}
              variant="outlined"
              margin="normal"
              value={appointmentState.name}
              onChange={(e) => setter.setName(e.target.value)}
            />
          </div>

          {/* Reason for consultation (common diseases + Other) */}
          <Typography variant="h6" mt={2} className="text-center">
            {t("af.reason")}
          </Typography>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadioGroup
              className="w-50"
              value={selectedSymptom}
              onChange={handleSymptomSelection}
            >
            {COMMON_DISEASES.map((disease) => (
              <FormControlLabel
                key={disease}
                value={disease}
                control={<Radio />}
                label={disease}
              />
            ))}
            <FormControlLabel
              value={SYMPTOM_OTHER}
              control={<Radio />}
              label={t("af.other")}
            />
            </RadioGroup>
          </div>

          {selectedSymptom === SYMPTOM_OTHER && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              className="w-50"
              multiline
              rows={1}
              label={t("af.symptoms")}
              variant="outlined"
              margin="normal"
              value={appointmentState.symptoms}
              onChange={handleDescriptionChange}
            />
          </div>
          )}

          {/* Mobile Number */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              className="w-50"
              label={t("af.mobile")}
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
            {t("af.consultType")}
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
            {t("af.when")}
          </Typography>
          <RadioGroup
            row
            value={appointmentState.timeSelection}
            onChange={handleTimeSelection}
            style={{ justifyContent: "center", marginBottom: "12px" }}
          >
            <FormControlLabel value={IS_NOW} control={<Radio />} label={t("af.now")} />
            <FormControlLabel
              value={CHOOSE_TIME}
              control={<Radio />}
              label={t("af.chooseTime")}
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
                      {t("af.selectSlot")}
                    </option>
                    {futureSlots.map((slot) => (
                      <option key={slot._id} value={slot._id}>
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {t("af.noSlots")}
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

          {/* Terms & Conditions */}
          <Box mt={3} mb={1} display="flex" alignItems="center" justifyContent="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!appointmentState.agreedToTerms}
                  onChange={(e) =>
                    setter.setAgreedToTerms ? setter.setAgreedToTerms(e.target.checked) : null
                  }
                  color="primary"
                  size="small"
                />
              }
              label={t("af.terms")}
            />
            <Tooltip title={t("af.viewTerms")}>
              <IconButton
                size="small"
                aria-label={t("af.viewTerms")}
                onClick={() => window.open("/terms-of-service", "_blank")}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Submit */}
          <Box mt={4} mb={4} display="flex" justifyContent="center">
            <ConsultationButton onClick={sendWhatsAppConfirmation}>
              {appointmentState.isLoading ? t("af.loading") : t("af.consult")}
            </ConsultationButton>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;