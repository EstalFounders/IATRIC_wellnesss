import React from 'react';
import styles from './css/appointmentPage.module.css';
import { isWithinBusinessHours, formatTime } from '../helper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { CHOOSE_TIME }  from '../../constant';
import { IS_NOW } from "../../../pages/api/utils/constants";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const slotMessage = (
  <div className="text-danger font-weight-bold">
    SLOTS WILL BE GENERATED SOON
  </div>
);

const AppointmentForm = ({appointmentState, setter, handleDoctorChoiceChange, handleDoctorSelection, handleTimeSelection, handleSlotSelection, handleConsultationChange, sendWhatsAppConfirmation, handleCloseSnackBar }) => {
    return (
        <>
        <div className="col-lg-8">
            <div className="txt-block pr-30">
              {/* Title */}
              <h3 className={`${styles.makeAppointmentText}`}>
                Make Appointment
              </h3>
              {/* Text */}
              <p className={styles.makeAppointmentSubText}>
                Porta semper lacus cursus, feugiat primis ultrice in ligula
                risus auctor tempus feugiat dolor lacinia cubilia curae integer
                congue leo metus, primis in orci integer metus mollis faucibus
              </p>
              {/* APPOINTMENT FORM */}
              <div className="text-center">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="appointment-form"
                >
                  {/* Symptoms Input */}
                  <textarea
                    name="symptoms"
                    className={styles.textarea}
                    placeholder="Describe your symptoms..."
                    value={appointmentState.symptoms}
                    onChange={(e) => setter.setSymptoms(e.target.value)}
                  />
                  <input
                    type="text"
                    name="name"
                    className={styles.input}
                    placeholder="Name*"
                    value={appointmentState.name}
                    onChange={(e) => setter.setName(e.target.value)}
                  />
                  <input
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="Email*"
                    value={appointmentState.email}
                    onChange={(e) => setter.setEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    name="mobile"
                    className={styles.input}
                    placeholder="Mobile Number*"
                    min={10}
                    max={10}
                    value={appointmentState.mobNo}
                    onChange={(e) => setter.setMobNo(e.target.value)}
                  />

                  <div className={styles.priceText}>
                    Price: {appointmentState.consultationprice} /-
                  </div>

                  {/* consultation type */}
                  <div
                    className="col-lg-12 mt-3"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {appointmentState.consultationTypes
                      .filter((item) => item.isActive) // Only include items with isActive: true
                      .map((option, index) => (
                        <label
                          key={option._id}
                          style={{
                            marginRight:
                              index === appointmentState.consultationTypes.length - 1
                                ? "0"
                                : "20px",
                          }}
                        >
                          <input
                            type="radio"
                            name="consultationType"
                            value={option.name}
                            checked={appointmentState.consultationType === option.name} // Compare with option.name
                            onChange={(e) => handleConsultationChange(e)}
                            style={{ marginRight: "10px" }}
                          />
                          <strong className={styles.radioText}>
                            {option.name}
                          </strong>{" "}
                          {/* Show name */}
                        </label>
                      ))}
                  </div>

                  {/* Doctor Choice */}
                  <div
                    className={`col-lg-12 ${styles.radioText}`}
                    style={{ textAlign: "center", marginBottom: "20px" }}
                  >
                    <label style={{ marginRight: "20px" }}>
                      <input
                        type="radio"
                        name="doctorChoice"
                        value="any"
                        checked={appointmentState.doctorChoice === "any"}
                        onChange={handleDoctorChoiceChange}
                        style={{ marginRight: "10px" }}
                      />
                      Any Doctor
                    </label>
                    {appointmentState.consultationType != "Home Visit" && (
                      <label style={{ marginLeft: "20px" }}>
                        <input
                          type="radio"
                          name="doctorChoice"
                          value="choose"
                          checked={appointmentState.doctorChoice === "choose"}
                          onChange={handleDoctorChoiceChange}
                          style={{ marginRight: "10px" }}
                        />
                        Choose a Doctor
                      </label>
                    )}
                  </div>

                  {/* Conditional Doctor Selection Dropdown */}
                  {appointmentState.doctorChoice === "choose" && (
                    <div className={`col-lg-12 ${styles.radioText}`}>
                      <select
                        name="doctor"
                        className="custom-select"
                        value={appointmentState.selectedDoctorId}
                        onChange={handleDoctorSelection}
                        required={appointmentState.doctorChoice === "choose"}
                      >
                        <option value="">
                          {" "}
                          {appointmentState.consultationType
                            ? "-- Please select doctor -- "
                            : " -- Please select consultation type -- "}{" "}
                        </option>
                        {appointmentState.filteredDoctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Time Selection */}
                  <div
                    className={`col-lg-12 ${styles.radioText}`}
                    style={{ textAlign: "center", marginBottom: "20px" }}
                  >
                    {isWithinBusinessHours && (
                      <label style={{ marginRight: "30px" }} className="ml-2">
                        <input
                          type="radio"
                          name="appointmentTime"
                          value={IS_NOW}
                          checked={appointmentState.timeSelection === IS_NOW}
                          onChange={handleTimeSelection}
                          style={{ marginRight: "10px" }}
                        />
                        {IS_NOW} {/* Display "Now" if within business hours */}
                      </label>
                    )}
                    <label style={{ marginRight: "30px" }} className="ml-3">
                      <input
                        type="radio"
                        name="appointmentTime"
                        value={CHOOSE_TIME}
                        checked={appointmentState.timeSelection === CHOOSE_TIME}
                        onChange={handleTimeSelection}
                        style={{ marginRight: "10px" }}
                      />
                      Choose Time
                    </label>
                  </div>

                  {/* Conditional Time Picker or Slots Display */}
                  {appointmentState.timeSelection === CHOOSE_TIME &&
                  appointmentState.doctorChoice === "choose" &&
                  appointmentState.selectedDoctorId ? (
                    <div>
                      <h3>Select a Date to View Available Slots</h3>
                      <DatePicker
                        selected={appointmentState.selectedDate}
                        onChange={(date) => setter.setSelectedDate(date)}
                        inline
                        minDate={new Date()}
                        highlightDates={appointmentState.availableSlots.map((slot) => ({
                          "react-datepicker__day--highlighted": new Date(
                            slot.startTime
                          ),
                        }))}
                      />
                      <ul>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                          }}
                        >
                          {console.log(appointmentState.availableSlots, "available slots")}
                          {!appointmentState.slotEmpty
                            ? appointmentState.availableSlots
                                .filter((slot) => {
                                  const slotDate = new Date(slot.startTime);
                                  return (
                                    !slot.isBooked &&
                                    slotDate.getTime() > new Date().getTime()
                                  );
                                })
                                .map((slot) => (
                                  <li
                                    key={slot._id}
                                    style={{
                                      color: "black",
                                      backgroundColor:
                                        appointmentState.selectedSlot._id === slot._id
                                          ? "#9f9856"
                                          : "white",
                                      border: "1px solid black",
                                      padding: "5px", // Reduced padding
                                      margin: "5px",
                                      borderRadius: "5px", // Reduced border-radius for a less rounded look
                                      width: "30%", // Adjust width to make boxes smaller
                                      maxWidth: "160px", // Maximum width to ensure they don't grow too large
                                      textAlign: "center",
                                      cursor: "pointer",
                                      transition: "background-color 0.3s",
                                      fontSize: "0.9rem", // Smaller font size for better readability in small boxes
                                      lineHeight: "1.4", // Adjust line height for better text spacing
                                    }}
                                    onClick={() => handleSlotSelection(slot)}
                                  >
                                    {formatTime(slot.startTime)} -{" "}
                                    {formatTime(slot.endTime)}
                                  </li>
                                ))
                            : slotMessage}
                        </div>
                      </ul>
                    </div>
                  ) : appointmentState.timeSelection === CHOOSE_TIME &&
                    appointmentState.doctorChoice === "any" ? (
                    <div className="col-lg-12">
                      <DatePicker
                        selected={appointmentState.selectedDate}
                        onChange={(date) => setter.setSelectedDate(date)}
                        inline
                        minDate={new Date()}
                        highlightDates={appointmentState.locallyCreatedSlots.map((slot) => ({
                          "react-datepicker__day--highlighted": new Date(
                            slot.startTime
                          ),
                        }))}
                      />
                      <ul>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                          }}
                        >
                          {console.log(
                            appointmentState.locallyCreatedSlots,
                            "locally created slots"
                          )}
                          {appointmentState.locallyCreatedSlots.length > 0
                            ? appointmentState.locallyCreatedSlots
                                .filter((slot) => {
                                  const currentDate = new Date();
                                  return (
                                    appointmentState.selectedDate.toDateString() ===
                                      slot.startTime.toDateString() &&
                                    slot.startTime > currentDate
                                  );
                                })
                                .map((slot) => (
                                  <li
                                    key={slot._id}
                                    style={{
                                      color: "black",
                                      backgroundColor:
                                        appointmentState.selectedSlot &&
                                        appointmentState.selectedSlot._id === slot._id
                                          ? "#9f9856"
                                          : "white",
                                      border: "1px solid black",
                                      padding: "5px",
                                      margin: "5px",
                                      borderRadius: "5px",
                                      width: "30%",
                                      maxWidth: "160px",
                                      textAlign: "center",
                                      cursor: "pointer",
                                      transition: "background-color 0.3s",
                                      fontSize: "0.9rem",
                                      lineHeight: "1.4",
                                    }}
                                    onClick={() => handleSlotSelection(slot)}
                                  >
                                    {formatTime(slot.startTime)} -{" "}
                                    {formatTime(slot.endTime)}
                                  </li>
                                ))
                            : slotMessage}
                        </div>
                      </ul>
                    </div>
                  ) : null}

                  {/* Submit Button */}
                  <div className="col-lg-12">
                    <button
                      type="submit"
                      className="btn btn-blue blue-hover"
                      onClick={sendWhatsAppConfirmation}
                    >
                      {appointmentState.isLoading ? "......" : "Consult"}
                    </button>
                  </div>
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
                </form>
              </div>

              {/* END APPOINTMENT FORM */}
              {/* Text */}
              <p className="p-sm grey-color mb-30">
                * Porta semper lacus cursus, feugiat primis ultrice in ligula
                risus auctor tempus feugiat dolor lacinia cubilia curae integer
                congue leo metus, primis in orci integer metus mollis faucibus
                enim. Nemo ipsam egestas volute turpis dolores ut aliquam
                quaerat sodales sapien undo pretium purus
              </p>
            </div>
          </div>
        </>
    );
};

export default AppointmentForm;