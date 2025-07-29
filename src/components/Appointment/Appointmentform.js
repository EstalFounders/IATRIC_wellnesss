import React from "react";
import styles from "./css/appointmentPage.module.css";
import { isWithinBusinessHours, formatTime } from "../helper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { CHOOSE_TIME } from "../../constant";
import { IS_NOW } from "../../../pages/api/utils/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ConsultationButton } from "../Common/commonUi";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";

const slotMessage = (
  <Typography variant="body2" color="error" fontWeight="bold">
    SLOTS WILL BE GENERATED SOON
  </Typography>
);

const AppointmentForm = ({
  appointmentState,
  setter,
  handleDoctorChoiceChange,
  handleDoctorSelection,
  handleTimeSelection,
  handleSlotSelection,
  handleConsultationChange,
  sendWhatsAppConfirmation,
  handleCloseSnackBar,
}) => {
  
  return (
    <div className="col-lg-8">
      <div className="txt-block pr-30">
        <Typography variant="h4" className={styles.makeAppointmentText}>
          Make Appointment
        </Typography>
        <Typography className={styles.makeAppointmentSubText}>
          Porta semper lacus cursus, feugiat primis ultrice in ligula risus
          auctor tempus feugiat dolor lacinia cubilia curae integer congue leo
          metus, primis in orci integer metus mollis faucibus
        </Typography>

        <form onSubmit={(e) => e.preventDefault()} className="appointment-form">
          <TextField
            multiline
            rows={0}
            fullWidth
            label="Describe your symptoms..."
            variant="outlined"
            margin="normal"
            value={appointmentState.symptoms}
            onChange={(e) => setter.setSymptoms(e.target.value)}
          />
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            value={appointmentState.name}
            onChange={(e) => setter.setName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            margin="normal"
            value={appointmentState.email}
            onChange={(e) => setter.setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Mobile Number"
            variant="outlined"
            type="tel"
            margin="normal"
            inputProps={{ minLength: 10, maxLength: 10 }}
            value={appointmentState.mobNo}
            onChange={(e) => setter.setMobNo(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="doctor-label">
              {" "}
              {appointmentState.serviceType
                ? appointmentState.serviceType
                : "Select Service type"}
            </InputLabel>
            <Select
              labelId="doctor-label"
              id="doctor"
              name="doctor"
              // value={appointmentState.serviceType.toString()}
              label="Select Service"
              onChange={(e) => setter.setServiceTypeId(e.target.value)}
            >
              {appointmentState.services.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" className={styles.priceText}>
            Price: {appointmentState.consultationprice} /-
          </Typography>

          {/* Consultation Type */}
          <RadioGroup
            row
            value={appointmentState.consultationType}
            onChange={handleConsultationChange}
            style={{ justifyContent: "center", marginBottom: "20px" }}
          >
            {appointmentState.consultationTypes
              .filter((item) => item.isActive)
              .map((option) => (
                <FormControlLabel
                  key={option._id}
                  value={option.name}
                  control={<Radio />}
                  label={<strong>{option.name}</strong>}
                />
              ))}
          </RadioGroup>

          {/* Doctor Choice */}
          <RadioGroup
            row
            value={appointmentState.doctorChoice}
            onChange={handleDoctorChoiceChange}
            style={{ justifyContent: "center", marginBottom: "20px" }}
          >
            <FormControlLabel
              value="any"
              control={<Radio />}
              label="Any Doctor"
            />
            {appointmentState.consultationType !== "Home Visit" && (
              <FormControlLabel
                value="choose"
                control={<Radio />}
                label="Choose a Doctor"
              />
            )}
          </RadioGroup>

          {/* Conditional Doctor Selection */}
          {appointmentState.doctorChoice === "choose" && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="doctor-label">
                {" "}
                {appointmentState.consultationType
                  ? "Select doctor"
                  : "Select consultation type"}
              </InputLabel>
              <Select
                labelId="doctor-label"
                id="doctor"
                name="doctor"
                value={appointmentState.selectedDoctorId}
                label="Select Doctor"
                onChange={handleDoctorSelection}
              >
                {appointmentState.filteredDoctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Time Selection */}
          <RadioGroup
            row
            value={appointmentState.timeSelection}
            onChange={handleTimeSelection}
            style={{ justifyContent: "center", marginBottom: "20px" }}
          >
            {isWithinBusinessHours && (
              <FormControlLabel
                value={IS_NOW}
                control={<Radio />}
                label={IS_NOW}
              />
            )}
            <FormControlLabel
              value={CHOOSE_TIME}
              control={<Radio />}
              label="Choose Time"
            />
          </RadioGroup>

          {/* Date Picker and Slots */}
          {appointmentState.timeSelection === CHOOSE_TIME && (
            <>
              <DatePicker
                selected={appointmentState.selectedDate}
                onChange={(date) => setter.setSelectedDate(date)}
                inline
                minDate={new Date()}
              />
              <Box display="flex" flexWrap="wrap" justifyContent="center">
                {(appointmentState.doctorChoice === "choose"
                  ? appointmentState.availableSlots
                  : appointmentState.locallyCreatedSlots
                )
                  .filter((slot) => {
                    const now = new Date();
                    return (
                      !slot.isBooked &&
                      new Date(slot.startTime).getTime() > now.getTime()
                    );
                  })
                  .map((slot) => (
                    <Box
                      key={slot._id}
                      onClick={() => handleSlotSelection(slot)}
                      sx={{
                        color: "black",
                        backgroundColor:
                          appointmentState.selectedSlot?._id === slot._id
                            ? "#9f9856"
                            : "white",
                        border: "1px solid black",
                        p: 1,
                        m: 1,
                        borderRadius: 1,
                        width: "30%",
                        maxWidth: "160px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                        fontSize: "0.9rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Box>
                  ))}
              </Box>
            </>
          )}

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

          <Box mt={4} mb={4} display="flex" justifyContent="center">
            <ConsultationButton onClick={sendWhatsAppConfirmation}>
              {appointmentState.isLoading ? "......" : "Consult"}
            </ConsultationButton>
          </Box>
        </form>

        <Typography variant="body2" color="textSecondary">
          * Porta semper lacus cursus, feugiat primis ultrice in ligula risus
          metus, primis in orci integer metus mollis faucibus enim. Nemo ipsam
          egestas volute turpis dolores ut aliquam quaerat sodales sapien undo
          pretium purus
        </Typography>
      </div>
    </div>
  );
};

export default AppointmentForm;
